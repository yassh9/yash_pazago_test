import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal from './ConfirmModal';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({
  isOpen,
  setIsOpen,
  isMobile,
  chatStore,
  onClearChat,
  hasMessages
}) {
  const { colors } = useTheme();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, sessionId: null, title: '' });

  const {
    getAllSessions,
    currentSessionId,
    createNewSession,
    switchToSession,
    deleteSession
  } = chatStore;

  const allSessions = getAllSessions();









  const handleDeleteClick = (sessionId, title) => {
    setConfirmModal({
      isOpen: true,
      sessionId,
      title
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.sessionId) {
      deleteSession(confirmModal.sessionId);
    }
    setConfirmModal({ isOpen: false, sessionId: null, title: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Within a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <aside
        className={`
          ${isMobile ? 'w-80 h-full' : 'w-80 h-screen'} 
          ${colors.sidebar.bg} ${colors.border.primary} border-r 
          shadow-xl transition-all duration-300 ease-in-out
          flex flex-col
        `}
        style={isMobile ? { height: '100vh', height: '100dvh' } : {}}
      >
        {/* Header */}
        <header className={`px-6 py-4 ${colors.border.primary} border-b flex-shrink-0`}>
          {isMobile ? (
            /* Mobile: Vertical layout */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">🌦️</div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${colors.button.ghost}
                  `}
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* New Chat Button - Full width on mobile */}
              <button
                onClick={() => createNewSession()}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium 
                  transition-colors bg-gray-300 hover:bg-black text-black hover:text-white
                `}
                aria-label="Create new chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Chat</span>
              </button>
            </div>
          ) : (
            /* Desktop: Horizontal layout */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xl">🌦️</div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* New Chat Button */}
                <button
                  onClick={() => createNewSession()}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium 
                    transition-colors bg-gray-300 hover:bg-black text-black hover:text-white
                  `}
                  aria-label="Create new chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Chat</span>
                </button>
              </div>
            </div>
          )}
        </header>
        
        {/* Chat Sessions List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {allSessions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mb-4 text-4xl">⛅</div>
              <p className={`text-sm ${colors.text.secondary}`}>
                No chats yet. Create one to get started!
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {allSessions.map((session) => (
                <li key={session.id}>
                  <div
                    className={`
                      group relative rounded-xl p-4 cursor-pointer transition-all duration-200
                      ${session.id === currentSessionId 
                        ? `bg-gray-200   dark:bg-gray-200 dark:text-black` 
                        : `bg-gray-50 hover:bg-gray-100 hover:shadow-md dark:bg-white dark:hover:bg-gray-300`
                      }
                    `}
                    onClick={() => {
                      console.log('Session clicked:', session.id); // Debug log
                      switchToSession(session.id);
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-start space-x-3 mb-2">
                          <div 
                            className={`
                              w-3 h-3 rounded-full mt-0.5 flex-shrink-0
                              ${session.id === currentSessionId ? 'bg-black' : 'bg-gray-400 dark:bg-gray-600'}
                            `} 
                          />
                          <div className="flex-1 min-w-0">
                              <p 
                                className={`
                                  text-sm font-medium leading-tight line-clamp-2
                                  ${session.id === currentSessionId 
                                    ? 'text-black' 
                                    : colors.text.primary
                                  }
                                `}
                              >
                                {session.metadata.title}
                              </p>
                            
                            <div className={`flex items-center space-x-2 text-xs mt-1 ${
                              session.id === currentSessionId ? 'text-black' : colors.text.tertiary
                            }`}>
                              <span>{session.metadata.messageCount} messages</span>
                              <span>•</span>
                              <span>{formatDate(session.metadata.lastActivity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Only Delete button */}
                      <div className={`flex items-center space-x-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200 flex-shrink-0`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(session.id, session.metadata.title);
                              }}
                              className={`p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors ${isMobile ? 'bg-red-50' : ''}`}
                              aria-label={`Delete chat ${session.metadata.title}`}
                              title="Delete"
                            >
                              <svg className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </nav>
        
        {/* Clear Chat and Dark Mode buttons at absolute bottom - side by side */}
        <div className={`mt-auto ${isMobile ? 'p-4 pb-6' : 'p-4'} border-t ${colors.border.primary} flex-shrink-0`}
             style={isMobile ? { paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' } : {}}>
          <div className="flex items-center justify-between space-x-3">
            {/* Clear Chat Button */}
            {hasMessages && (
              <button
                onClick={() => {
                  setIsOpen(false); // Close sidebar first
                  onClearChat(); // Then trigger clear chat
                }}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm flex-1
                  transition-colors ${colors.button.danger || colors.button.ghost}
                `}
                title="Clear current chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Chat</span>
              </button>
            )}
            
            {/* Dark Mode Toggle - Icon only */}
            <div className={`${hasMessages ? '' : 'ml-auto'}`} title="Toggle dark mode">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, sessionId: null, title: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Chat"
        message={`Are you sure you want to delete "${confirmModal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
}
