import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Searchbox from './components/Searchbox.jsx'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import ErrorModal from './components/ErrorModal.jsx'
import ConfirmModal from './components/ConfirmModal.jsx'
import useChatStore from './utils/storage.js'

function AppContent() {
  const { colors } = useTheme();
  const [value, SetValue] = useState("")
  const [sendMessage, setSendMessage] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const chatAreaRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false);
  const [currentError, setCurrentError] = useState(null);
  const [ErrorModalState, setErrorModalState] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [clearChatModal, setClearChatModal] = useState({ isOpen: false });
  
  const chatStore = useChatStore();
  const { 
    addMessageToCurrentSession,
    updateLastMessage,
    getCurrentMessages, 
    currentSessionId,
    createNewSession,
    switchToSession,
    clearCurrentSession,
    getSessionMetadata
  } = chatStore;
  
  const messageData = getCurrentMessages();
  const currentSessionMetadata = getSessionMetadata(currentSessionId);
  
  console.log('App render state:', {
    currentSessionId,
    messageDataLength: messageData?.length || 0,
    currentSessionTitle: currentSessionMetadata?.title
  }); // Debug log

  const handleUserMessage = useCallback((userMessage) => {
    if (!currentSessionId) {
      createNewSession();
    }
    
    const userMsg = { isUser: true, message: userMessage, timestamp: new Date().toISOString() };
    addMessageToCurrentSession(userMsg);
    
    callWeatherAgent(userMessage);
  }, [currentSessionId, createNewSession, addMessageToCurrentSession]);

  const callWeatherAgent = useCallback(async (userMessage) => {
    const api = "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream"
    const body = {
      "messages": [
        {
            "role": "user",
            "content": userMessage
        }
    ],
    "runId": "weatherAgent",
    "maxRetries": 2,
    "maxSteps": 5,
    "temperature": 0.5,
    "topP": 1,
    "runtimeContext": {},
    "threadId": 2,
    "resourceId": "weatherAgent"
    }

    try {
      setIsLoading(true)
      const res = await fetch(api, {
        method: "POST",
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
          "x-missing-dev-playground": "true"
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: `;
        if (res.status >= 500) {
          errorMessage += "Server Error";
        } else if (res.status >= 400) {
          errorMessage += "Client Error";  
        }
        throw new Error(errorMessage);
      }

      // Add empty bot message to store
      const botMsg = { isUser: false, message: "", timestamp: new Date().toISOString() };
      addMessageToCurrentSession(botMsg);
      
      setIsStreaming(true);
      setIsLoading(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder();
      let streamedResponse = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.match(/^\d+:/)) {
              const content = line.substring(line.indexOf(':') + 1);
              const cleanContent = content.replace(/^"|"$/g, '');

              if (cleanContent &&
                !cleanContent.includes('{"toolCallId"') &&
                !cleanContent.includes('"toolName"') &&
                !cleanContent.includes('"args"')) {

                streamedResponse += cleanContent.replace(/\\n/g, ' ');

                updateLastMessage(streamedResponse);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        setIsStreaming(false);
      }
    } catch (error) {
      setIsStreaming(false);
      setIsLoading(false);

      let errorInfo = {
        type: 'network',
        title: 'Connection Error',
        message: 'Connection lost. Please check your internet.',
        canRetry: true
      };

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        errorInfo = {
          type: 'network',
          title: 'Connection Timeout',
          message: 'Connection lost. Please check your internet.',
          canRetry: true
        };
      } else if (error.message.includes('Failed to fetch') || !navigator.onLine) {
        errorInfo = {
          type: 'network',
          title: 'Network Error',
          message: 'Connection lost. Please check your internet.',
          canRetry: true
        };
      } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        errorInfo = {
          type: 'server',
          title: 'Server Error',
          message: 'Something went wrong. Please try again later.',
          canRetry: true
        };
      } else if (error.message.includes('400') || error.message.includes('404') || error.message.includes('403')) {
        errorInfo = {
          type: 'client',
          title: 'Request Error',
          message: 'Request invalid. Please try again.',
          canRetry: false
        };
      }

      setCurrentError(errorInfo);
      setErrorModalState(true);
    }
  }, [updateLastMessage, setIsLoading, setIsStreaming, setCurrentError, setErrorModalState]);

  const handleClearChat = useCallback(() => {
    setClearChatModal({ isOpen: true });
  }, []);

  const confirmClearChat = useCallback(() => {
    clearCurrentSession();
    setClearChatModal({ isOpen: false });
  }, [clearCurrentSession]);

  useEffect(() => {
    if (sendMessage && value.trim()) {
      handleUserMessage(value.trim());
      SetValue("");
      setSendMessage(false);
    }
  }, [sendMessage, value, handleUserMessage]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Sidebar should remain closed by default for both mobile and desktop
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const closeErrorModal = () => {
    setErrorModalState(false);
  }

  const retryLastMessage = () => {
    if (messageData.length > 0) {
      const lastUserMessage = [...messageData].reverse().find(msg => msg.isUser);
      if (lastUserMessage) {
        setErrorModalState(false);
        setCurrentError(null);
        callWeatherAgent(lastUserMessage.message);
      }
    }
  };

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isMobile ? 'relative overflow-hidden' : 'flex'}`} 
         style={isMobile ? { height: '100vh', height: '100dvh' } : {}}>
      {/* Mobile overlay when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Error Modal */}
      {ErrorModalState && currentError && (
        <ErrorModal
          onClose={closeErrorModal}
          info={currentError.message}
          canRetry={currentError.canRetry}
          onRetry={retryLastMessage}
        />
      )}

      {/* Clear Chat Confirmation Modal */}
      <ConfirmModal
        isOpen={clearChatModal.isOpen}
        onClose={() => setClearChatModal({ isOpen: false })}
        onConfirm={confirmClearChat}
        title="Clear Chat"
        message="Are you sure you want to clear all messages in this chat? This action cannot be undone."
        confirmText="Clear Chat"
        type="warning"
      />

      {/* Sidebar - different behavior for mobile vs desktop */}
      {isMobile ? (
        // Mobile: Fixed overlay sidebar
        sidebarOpen && (
          <div className="fixed inset-y-0 left-0 z-40 w-80">
            <Sidebar 
              isOpen={sidebarOpen} 
              setIsOpen={setSidebarOpen} 
              isMobile={isMobile}
              chatStore={chatStore}
              onClearChat={handleClearChat}
              hasMessages={messageData && messageData.length > 0}
            />
          </div>
        )
      ) : (
        // Desktop: Slides in and pushes content
        <div className={`
          transition-all duration-300 ease-in-out 
          ${sidebarOpen ? 'w-80' : 'w-0'} 
          flex-shrink-0 overflow-hidden
        `}>
          <Sidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
            isMobile={isMobile}
            chatStore={chatStore}
            onClearChat={handleClearChat}
            hasMessages={messageData && messageData.length > 0}
          />
        </div>
      )}

      {/* Main Content - Full screen with overlay hamburger */}
      <div className={`relative flex flex-col transition-all duration-300 ease-in-out ${isMobile ? 'w-full h-full' : 'flex-1 h-screen'}`}>
        {/* Hamburger button - Fixed overlay position */}
        <button 
          className={`
            fixed top-4 left-4 z-50
            ${isMobile ? 'p-3' : 'p-2'} rounded-lg transition-colors ${colors.button.ghost}
            ${isMobile ? 'min-w-[44px] min-h-[44px]' : ''}
            flex items-center justify-center
            ${colors.bg.secondary} shadow-lg backdrop-blur-sm
          `}
          onClick={handleSidebarToggle}
          aria-label="Toggle sidebar"
        >
          {/* 3-line hamburger menu */}
          <svg className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Chat Area - Full height */}
        <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'h-full relative' : 'h-full'}`}>
          {/* Container to limit width on desktop */}
          <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : 'max-w-4xl mx-auto w-full px-6'} h-full`}>
            {/* Message area - scrollable, takes available space, full height */}
            <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-18 mb-2' : ''}`}>
              <ChatWindow
                messages={messageData}
                isLoading={isLoading}
                isStreaming={isStreaming}
                isMobile={isMobile}
                sidebarOpen={sidebarOpen}
                currentSessionId={currentSessionId}
              />
            </div>
            
            {/* Input Area - Fixed at bottom with extra mobile spacing */}
            <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-30 px-4 py-3' : 'flex-shrink-0'}`} 
                 style={isMobile ? { paddingBottom: 'calc(1rem + env(safe-area-inset-bottom) + 60px)' } : {}}>
              <Searchbox 
                SetValue={SetValue} 
                value={value} 
                SetAction={setSendMessage} 
                disabled={isStreaming || isLoading} 
                isMobile={isMobile}
                sidebarOpen={sidebarOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
