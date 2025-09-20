import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { encryptData, decryptData } from '../utils/security';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Action types
const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  SET_THREADS: 'SET_THREADS',
  SET_SELECTED_THREAD: 'SET_SELECTED_THREAD',
  ADD_MESSAGE: 'ADD_MESSAGE',
  CREATE_THREAD: 'CREATE_THREAD',
  DELETE_THREAD: 'DELETE_THREAD',
  RENAME_THREAD: 'RENAME_THREAD',
  ARCHIVE_THREAD: 'ARCHIVE_THREAD',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TYPING: 'SET_TYPING',
  CLEAR_THREAD: 'CLEAR_THREAD',
  SET_DARK_MODE: 'SET_DARK_MODE'
};

// Initial state
const initialState = {
  threads: {},
  selectedThreadId: null,
  archivedThreads: {},
  isLoading: false,
  error: null,
  isTyping: false,
  typingText: '',
  isDarkMode: false,
  searchQuery: '',
  filteredThreads: {}
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_STATE:
      return { ...state, ...action.payload };

    case ACTIONS.SET_THREADS:
      return { ...state, threads: action.payload };

    case ACTIONS.SET_SELECTED_THREAD:
      return { ...state, selectedThreadId: action.payload };

    case ACTIONS.ADD_MESSAGE:
      const { threadId, message } = action.payload;
      return {
        ...state,
        threads: {
          ...state.threads,
          [threadId]: [...(state.threads[threadId] || []), message]
        }
      };

    case ACTIONS.CREATE_THREAD:
      const { id, initialMessages = [] } = action.payload;
      return {
        ...state,
        threads: {
          ...state.threads,
          [id]: initialMessages
        },
        selectedThreadId: id
      };

    case ACTIONS.DELETE_THREAD:
      const { [action.payload]: deleted, ...remainingThreads } = state.threads;
      const remainingIds = Object.keys(remainingThreads);
      return {
        ...state,
        threads: remainingThreads,
        selectedThreadId: state.selectedThreadId === action.payload 
          ? (remainingIds.length > 0 ? remainingIds[0] : null)
          : state.selectedThreadId
      };

    case ACTIONS.RENAME_THREAD:
      // Note: Thread names are derived from first message, this would update metadata
      return state;

    case ACTIONS.ARCHIVE_THREAD:
      const threadToArchive = state.threads[action.payload];
      const { [action.payload]: archived, ...activeThreads } = state.threads;
      return {
        ...state,
        threads: activeThreads,
        archivedThreads: {
          ...state.archivedThreads,
          [action.payload]: threadToArchive
        },
        selectedThreadId: state.selectedThreadId === action.payload ? null : state.selectedThreadId
      };

    case ACTIONS.CLEAR_THREAD:
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.payload]: []
        }
      };

    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.SET_TYPING:
      return { 
        ...state, 
        isTyping: action.payload.isTyping,
        typingText: action.payload.text || ''
      };

    case ACTIONS.SET_DARK_MODE:
      return { ...state, isDarkMode: action.payload };

    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const encryptedThreads = localStorage.getItem('weather-chat-threads');
      const encryptedSelected = localStorage.getItem('weather-chat-selected');
      const encryptedDarkMode = localStorage.getItem('weather-chat-dark-mode');

      const threads = encryptedThreads ? decryptData(encryptedThreads) : {};
      const selectedThreadId = encryptedSelected ? decryptData(encryptedSelected) : null;
      const isDarkMode = encryptedDarkMode ? JSON.parse(encryptedDarkMode) : false;

      dispatch({
        type: ACTIONS.LOAD_STATE,
        payload: {
          threads: threads || {},
          selectedThreadId,
          isDarkMode
        }
      });
    } catch (error) {
      console.error('Failed to load chat state:', error);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      const encryptedThreads = encryptData(state.threads);
      localStorage.setItem('weather-chat-threads', encryptedThreads);
    } catch (error) {
      console.error('Failed to save threads:', error);
    }
  }, [state.threads]);

  useEffect(() => {
    if (state.selectedThreadId) {
      try {
        const encryptedSelected = encryptData(state.selectedThreadId);
        localStorage.setItem('weather-chat-selected', encryptedSelected);
      } catch (error) {
        console.error('Failed to save selected thread:', error);
      }
    }
  }, [state.selectedThreadId]);

  useEffect(() => {
    localStorage.setItem('weather-chat-dark-mode', JSON.stringify(state.isDarkMode));
  }, [state.isDarkMode]);

  // Action creators
  const actions = {
    setThreads: (threads) => dispatch({ type: ACTIONS.SET_THREADS, payload: threads }),
    
    setSelectedThread: (threadId) => dispatch({ type: ACTIONS.SET_SELECTED_THREAD, payload: threadId }),
    
    addMessage: (threadId, message) => dispatch({ 
      type: ACTIONS.ADD_MESSAGE, 
      payload: { threadId, message } 
    }),
    
    createThread: (id, initialMessages) => dispatch({ 
      type: ACTIONS.CREATE_THREAD, 
      payload: { id, initialMessages } 
    }),
    
    deleteThread: (threadId) => dispatch({ type: ACTIONS.DELETE_THREAD, payload: threadId }),
    
    archiveThread: (threadId) => dispatch({ type: ACTIONS.ARCHIVE_THREAD, payload: threadId }),
    
    clearThread: (threadId) => dispatch({ type: ACTIONS.CLEAR_THREAD, payload: threadId }),
    
    setLoading: (isLoading) => dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading }),
    
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    
    setTyping: (isTyping, text = '') => dispatch({ 
      type: ACTIONS.SET_TYPING, 
      payload: { isTyping, text } 
    }),
    
    toggleDarkMode: () => dispatch({ type: ACTIONS.SET_DARK_MODE, payload: !state.isDarkMode }),
    
    setDarkMode: (isDark) => dispatch({ type: ACTIONS.SET_DARK_MODE, payload: isDark })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};