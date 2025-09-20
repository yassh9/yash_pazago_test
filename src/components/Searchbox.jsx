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
    <div className={`${colors.bg.secondary} ${isMobile ? 'p-3' : 'p-4'}`}>
      <form onSubmit={handleSubmit} className={`${isMobile ? 'max-w-full' : 'mx-auto'}`} style={isMobile ? {} : { width: '721px' }}>
        <div className={`
          relative rounded-2xl border transition-all duration-200 
          ${colors.border.secondary} ${colors.bg.input}
          focus-within:${colors.border.focus}
          ${isMobile ? 'min-h-[56px]' : ''}
          shadow-sm
        `}
        style={{
          boxShadow: '-4px 4px 8px rgba(0, 0, 0, 0.1), -2px 2px 4px rgba(0, 0, 0, 0.05)',
          ...(isMobile ? {} : { height: '112px' })
        }}>
          <input
            type="text"
            value={value}
            onChange={(e) => SetValue(e.target.value)}
            placeholder=""
            disabled={disabled}
            maxLength={500}
            className={`
              w-full ${isMobile ? 'px-5 py-4 pr-16 pb-16' : 'px-6 py-5 pr-20 pb-20 text-lg'}
              rounded-2xl transition-all duration-200 bg-transparent
              ${colors.text.primary}
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isMobile ? 'min-h-[56px]' : 'h-full'}
            `}
          />
          
          <button
            type="submit"
            disabled={disabled}
            className={`
              absolute ${isMobile ? 'right-3 bottom-3' : 'right-4 bottom-4'}
              ${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-lg transition-all duration-200
              flex items-center justify-center
              bg-black hover:bg-gray-800 text-white hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-gray-500/20
            `}
            aria-label="Send message"
          >
            {disabled ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}