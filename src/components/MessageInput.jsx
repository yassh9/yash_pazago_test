
import React, { useEffect } from 'react';
import { useAutoResize } from '../hooks/usePerformance';
import { validateMessage, messageLimiter } from '../utils/security';
import { useToast } from './Toast';
import { useTheme } from '../context/ThemeContext';

export default function MessageInput({ input, setInput, sendMessage, disabled, isLoading, isTyping, shouldFocus }) {
  const { textareaRef, resize } = useAutoResize(48, 120);
  const { error: showErrorToast, warning: showWarningToast } = useToast();
  const { colors } = useTheme();

  // Auto-focus the input when shouldFocus prop changes
  useEffect(() => {
    if (shouldFocus && textareaRef.current && !disabled && !isLoading && !isTyping) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [shouldFocus, disabled, isLoading, isTyping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    resize();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!messageLimiter.isAllowed()) {
      const remainingTime = Math.ceil(messageLimiter.getRemainingTime() / 1000);
      showWarningToast(`Rate limit exceeded. Please wait ${remainingTime} seconds.`);
      return;
    }

    // Input validation
    const validation = validateMessage(input);
    if (!validation.isValid) {
      showErrorToast(validation.errors[0]);
      return;
    }

    // Send sanitized message
    const sanitizedInput = validation.sanitized;
    sendMessage(e, sanitizedInput);
  };

  return (
    <div className={`${colors.bg.secondary} ${colors.border.primary} border-t p-4`}>
      <form onSubmit={handleSubmit} className="flex items-end space-x-3 max-w-5xl mx-auto">
        <div className="flex-1 relative">
          <div className={`
            relative rounded-2xl border transition-all duration-200 
            ${colors.border.secondary} ${colors.bg.input}
            focus-within:${colors.border.focus} focus-within:ring-2 focus-within:ring-blue-500/20
          `}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              disabled={disabled}
              placeholder={
                disabled
                  ? "Please select or create a chat to start"
                  : "Ask anything about the weather..."
              }
              rows={1}
              className={`
                w-full resize-none rounded-2xl px-4 py-3 pr-20 
                focus:outline-none transition-all duration-200 bg-transparent 
                scrollbar-none min-h-[48px] max-h-[120px]
                ${colors.text.primary} placeholder:${colors.text.tertiary}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleSubmit(e);
                }
              }}
              aria-label="Message input"
            />
            
            {/* Character count */}
            <div className={`
              absolute bottom-2 right-4 text-xs transition-colors duration-300 pointer-events-none
              ${input.length > 400 ? 'text-red-500' : colors.text.tertiary}
            `}>
              {input.length}/500
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled || isTyping}
          className={`
            h-[48px] px-6 rounded-2xl font-medium transition-all duration-200 
            min-w-[100px] flex-shrink-0 flex items-center justify-center
            ${colors.button.primary}
            hover:scale-105 active:scale-95 disabled:hover:scale-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            disabled:cursor-not-allowed shadow-lg hover:shadow-xl
            disabled:opacity-50
          `}
          aria-label="Send message"
        >
          <div className="flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline text-sm">Sending...</span>
              </>
            ) : isTyping ? (
              <>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="hidden sm:inline text-sm">Typing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="hidden sm:inline text-sm">Send</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
}
