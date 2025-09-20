import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Searchbox({ SetValue, value, SetAction, disabled, isMobile = false, sidebarOpen = false }) {
  const { colors } = useTheme();
  
  // Calculate max width based on sidebar state - same as ChatWindow for alignment
  const maxWidth = sidebarOpen ? 'max-w-4xl' : 'max-w-3xl';
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      SetAction(true)
    }
  }

  return (
    <div className={`${colors.bg.secondary} ${isMobile ? 'p-3 pb-6' : 'p-4'}`} 
         style={isMobile ? { paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' } : {}}>
      <form onSubmit={handleSubmit} className={`${isMobile ? 'max-w-full' : `${maxWidth} mx-auto`}`}>
        <div className={`
          relative rounded-xl border-2 transition-all duration-200 
          ${colors.border.secondary} ${colors.bg.input}
          focus-within:${colors.border.focus} focus-within:ring-2 focus-within:ring-blue-500/10
          ${isMobile ? 'min-h-[44px]' : ''}
        `}>
          <input
            type="text"
            value={value}
            onChange={(e) => SetValue(e.target.value)}
            placeholder="Ask me about the weather..."
            disabled={disabled}
            maxLength={500}
            className={`
              w-full ${isMobile ? 'px-3 py-3 pr-12 text-base' : 'px-4 py-3 pr-12 text-base'}
              rounded-xl transition-all duration-200 bg-transparent
              ${colors.text.primary} placeholder:${colors.text.tertiary}
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isMobile ? 'min-h-[44px]' : ''}
            `}
          />
          
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className={`
              absolute right-2 top-1/2 transform -translate-y-1/2
              h-8 w-8 rounded-lg transition-all duration-200
              flex items-center justify-center
              ${value.trim() && !disabled 
                ? `!bg-black hover:!bg-gray-800 !text-white hover:scale-105` 
                : `!bg-gray-300 !text-gray-500 cursor-not-allowed`
              }
              focus:outline-none focus:ring-2 focus:ring-gray-500/50
            `}
            aria-label="Send message"
          >
            {disabled ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l10-10M17 7H7" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}