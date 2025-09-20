import React from 'react';
import { useTheme } from '../context/ThemeContext';

const SuggestionButtons = ({ onSuggestionClick, isVisible = true, isMobile = false, isNewChat = false }) => {
  const { colors } = useTheme();

  const suggestions = [
    "What's the weather like today?",
    "Will it rain this week?",
    "What's the temperature forecast?"
  ];

  if (!isVisible || isNewChat) {
    return null;
  }

  return (
    <div className={`${isMobile ? 'px-4' : ''} ${isNewChat ? 'fixed bottom-4 right-4' : 'mb-4'}`}>
      <div className={`${isMobile ? 'w-full' : ''} flex flex-col gap-2`}
           style={isMobile ? {} : isNewChat ? {} : { width: '721px', margin: '0 auto' }}>
        <div className="flex flex-col gap-2 ml-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className={`
                text-left px-4 py-3 rounded-lg border transition-all duration-200
                ${colors.border.primary} ${colors.bg.secondary}
                hover:${colors.border.focus} hover:shadow-sm
                text-sm
              `}
              style={{
                color: '#4B5563',
                height: '68px',
                width: '520px'
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionButtons;