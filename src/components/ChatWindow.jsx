import React, { useRef, useEffect } from "react";
import { useTheme } from '../context/ThemeContext';

export default function ChatWindow({ 
  messages = [], 
  isLoading, 
  isStreaming, 
  isMobile = false,
  sidebarOpen = false,
  currentSessionId = null
}) {
  const { colors } = useTheme();
  const messagesEndRef = useRef(null);
  
  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];
  
  // Calculate max width based on sidebar state - reduce by 15% when sidebar is hidden
  const maxWidth = sidebarOpen ? 'max-w-4xl' : 'max-w-3xl';
  
  // Auto-scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [safeMessages.length, isStreaming, isLoading]);
  
  // Only show blank landing page when there's no current session AND no messages
  if (safeMessages.length === 0 && !isLoading && !currentSessionId) {
    return (
      <div className={`w-full h-full ${colors.bg.secondary}`}>
        {/* Blank landing page */}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className={`w-full h-full overflow-y-auto px-4 md:px-6 pt-0 pb-4 space-y-6 ${colors.bg.secondary} scrollbar-none`}>
        {safeMessages.map((message, index) => (
          <div
            key={index}
            className={`${maxWidth} mx-auto flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 max-w-[80%] rounded-2xl transition-all duration-200 ${
                message.isUser
                  ? `${colors.message.bot} ml-auto`
                  : `bg-transparent mr-auto`
              }`}
            >
              <div className="leading-relaxed whitespace-pre-wrap">
                {message.message}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={`${maxWidth} mx-auto flex justify-start`}>
            <div className="px-4 py-3 bg-transparent flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        
        {/* Invisible element for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
