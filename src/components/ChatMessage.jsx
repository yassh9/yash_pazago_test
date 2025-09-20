import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ChatMessage = ({ message, isUser, isStreaming = false }) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatMessage = (text) => {
    return text
      .replace(/\n/g, '<br>')
      .replace(/(\d+\.)/g, '<strong>$1</strong>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  const shouldShowExpand = message.length > 300;
  const displayMessage = shouldShowExpand && !isExpanded 
    ? message.slice(0, 300) + '...' 
    : message;

  return (
    <div 
      className={`
        flex w-full mb-4 animate-in slide-in-from-bottom-2 duration-300
        ${isUser ? 'justify-end' : 'justify-start'}
      `}
    >
      <div 
        className={`
          flex max-w-[85%] md:max-w-[70%] items-end space-x-3
          ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}
        `}
      >
        {/* Avatar */}
        <div 
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${isUser 
              ? 'bg-blue-500 text-white' 
              : `${colors.bg.tertiary} ${colors.text.secondary}`
            }
          `}
        >
          {isUser ? '👤' : '🌦️'}
        </div>

        {/* Message Content */}
        <div className="flex flex-col space-y-1 min-w-0">
          {/* Message Bubble */}
          <div 
            className={`
              relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200
              ${isUser 
                ? `${colors.message.user} rounded-br-md` 
                : `${colors.message.bot} rounded-bl-md`
              }
              ${isStreaming ? 'animate-pulse' : ''}
            `}
          >
            {/* Message Text */}
            <div 
              className="text-sm leading-relaxed break-words"
              dangerouslySetInnerHTML={{
                __html: isUser ? displayMessage : formatMessage(displayMessage)
              }}
            />

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex items-center space-x-1 mt-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full opacity-60 animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-current rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}

            {/* Expand/Collapse button */}
            {shouldShowExpand && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  mt-2 text-xs font-medium transition-colors underline
                  ${isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}
                `}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Timestamp */}
          <div 
            className={`
              text-xs ${colors.text.tertiary} px-2
              ${isUser ? 'text-right' : 'text-left'}
            `}
          >
            {new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;