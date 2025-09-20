import { useState, useEffect } from 'react'
import { generateThreadId } from './threadId.js'

// Enhanced chat store implementation with thread metadata
let chatStore = {
  sessions: {},
  sessionMetadata: {}, // Stores title, createdAt, lastActivity for each session
  currentSessionId: null,
  listeners: []
}

// Initialize the store from localStorage immediately when module loads
const initializeStore = () => {
  try {
    const saved = localStorage.getItem('chatSessions')
    const savedMetadata = localStorage.getItem('sessionMetadata')
    const currentSession = localStorage.getItem('currentSessionId')
    
    if (saved) {
      chatStore.sessions = JSON.parse(saved)
    }
    
    if (savedMetadata) {
      chatStore.sessionMetadata = JSON.parse(savedMetadata)
    }
    
    if (currentSession && chatStore.sessions[currentSession]) {
      chatStore.currentSessionId = currentSession
    }
  } catch (e) {
    console.error('Failed to initialize chat store:', e)
  }
}

// Initialize immediately
initializeStore()

const useChatStore = () => {
  const [forceUpdateValue, setForceUpdateValue] = useState(0)

  useEffect(() => {
    // Store is already initialized, just set up the listener
    const listener = () => {
      setForceUpdateValue(prev => prev + 1)
    }
    chatStore.listeners.push(listener)

    return () => {
      chatStore.listeners = chatStore.listeners.filter(l => l !== listener)
    }
  }, [])

  const notify = () => {
    // Save to localStorage
    try {
      localStorage.setItem('chatSessions', JSON.stringify(chatStore.sessions))
      localStorage.setItem('sessionMetadata', JSON.stringify(chatStore.sessionMetadata))
      if (chatStore.currentSessionId) {
        localStorage.setItem('currentSessionId', chatStore.currentSessionId)
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
    
    // Notify all listeners immediately
    chatStore.listeners.forEach(listener => {
      try {
        listener()
      } catch (error) {
        console.error('Error in listener:', error)
      }
    })
  }

  const createNewSession = (title = null) => {
    const id = generateThreadId()
    const now = new Date().toISOString()
    
    console.log('Creating new session:', id); // Debug log
    
    // Ensure we have a clean state
    chatStore.sessions[id] = []
    chatStore.sessionMetadata[id] = {
      title: title || 'New Chat',
      createdAt: now,
      lastActivity: now,
      messageCount: 0
    }
    
    // Set as current session
    chatStore.currentSessionId = id
    
    console.log('New session created, current ID:', chatStore.currentSessionId); // Debug log
    
    // Force immediate notification
    notify()
    
    // Return the session ID
    return id
  }

  const switchToSession = (sessionId) => {
    console.log('switchToSession called with:', sessionId); // Debug log
    if (chatStore.sessions[sessionId]) {
      console.log('Session exists, switching from:', chatStore.currentSessionId, 'to:', sessionId); // Debug log
      chatStore.currentSessionId = sessionId
      notify()
      console.log('Session switched, new current session:', chatStore.currentSessionId); // Debug log
    } else {
      console.log('Session does not exist:', sessionId); // Debug log
    }
  }

  const deleteSession = (sessionId) => {
    if (chatStore.sessions[sessionId]) {
      delete chatStore.sessions[sessionId]
      delete chatStore.sessionMetadata[sessionId]
      
      // If deleting current session, switch to another or clear
      if (chatStore.currentSessionId === sessionId) {
        const remainingSessions = Object.keys(chatStore.sessions)
        chatStore.currentSessionId = remainingSessions.length > 0 ? remainingSessions[0] : null
      }
      
      notify()
    }
  }

  const updateSessionTitle = (sessionId, newTitle) => {
    if (chatStore.sessionMetadata[sessionId]) {
      chatStore.sessionMetadata[sessionId].title = newTitle
      chatStore.sessionMetadata[sessionId].lastActivity = new Date().toISOString()
      notify()
    }
  }

  const clearCurrentSession = () => {
    if (chatStore.currentSessionId && chatStore.sessions[chatStore.currentSessionId]) {
      chatStore.sessions[chatStore.currentSessionId] = []
      if (chatStore.sessionMetadata[chatStore.currentSessionId]) {
        chatStore.sessionMetadata[chatStore.currentSessionId].messageCount = 0
        chatStore.sessionMetadata[chatStore.currentSessionId].lastActivity = new Date().toISOString()
      }
      notify()
    }
  }

  // Helper function to generate meaningful titles from user messages
  const generateTitleFromMessage = (message) => {
    const text = message.trim()
    
    // If message is too short, just use it
    if (text.length <= 35) {
      return text
    }
    
    const lowerText = text.toLowerCase()
    
    // Extract location names and weather keywords
    const weatherKeywords = ['weather', 'temperature', 'temp', 'rain', 'snow', 'forecast', 'climate', 'sunny', 'cloudy', 'wind', 'humidity', 'hot', 'cold', 'warm', 'cool']
    const locationPattern = /(?:in|for|at|from)\s+([a-z\s,]+?)(?:\s|$|\?|!|\.)/i
    
    // Try to extract location
    const locationMatch = text.match(locationPattern)
    const location = locationMatch ? locationMatch[1].trim() : null
    
    // Check for weather keywords
    const hasWeatherKeyword = weatherKeywords.some(keyword => lowerText.includes(keyword))
    
    if (location && hasWeatherKeyword) {
      // Format: "Weather in [Location]"
      const cleanLocation = location.split(',')[0].trim()
      return `Weather in ${cleanLocation}`
    } else if (location) {
      // Just location mentioned
      const cleanLocation = location.split(',')[0].trim()
      return `${cleanLocation} weather`
    } else if (hasWeatherKeyword) {
      // Weather keyword but no clear location
      const title = text.slice(0, 40)
      return title.length < text.length ? title + "..." : title
    } else {
      // General query - take first meaningful part
      const title = text.slice(0, 35)
      return title.length < text.length ? title + "..." : title
    }
  }

  const addMessageToCurrentSession = (message) => {
    if (!chatStore.currentSessionId) {
      createNewSession()
    }
    if (!chatStore.sessions[chatStore.currentSessionId]) {
      chatStore.sessions[chatStore.currentSessionId] = []
    }
    
    chatStore.sessions[chatStore.currentSessionId].push(message)
    
    // Update metadata
    const sessionId = chatStore.currentSessionId
    if (chatStore.sessionMetadata[sessionId]) {
      chatStore.sessionMetadata[sessionId].messageCount = chatStore.sessions[sessionId].length
      chatStore.sessionMetadata[sessionId].lastActivity = new Date().toISOString()
      
      // Auto-generate title from first user message
      if (message.isUser && chatStore.sessionMetadata[sessionId].title === 'New Chat') {
        const newTitle = generateTitleFromMessage(message.message)
        chatStore.sessionMetadata[sessionId].title = newTitle
        console.log('Updated session title from:', 'New Chat', 'to:', newTitle) // Debug log
      } else if (message.isUser) {
        console.log('Title not updated. Current title:', chatStore.sessionMetadata[sessionId].title, 'Message:', message.message) // Debug log
      }
    }
    
    notify()
  }

  const updateLastMessage = (content) => {
    if (!chatStore.currentSessionId || !chatStore.sessions[chatStore.currentSessionId]) {
      return
    }
    const messages = chatStore.sessions[chatStore.currentSessionId]
    if (messages.length > 0) {
      messages[messages.length - 1].message = content
      
      // Update last activity
      const sessionId = chatStore.currentSessionId
      if (chatStore.sessionMetadata[sessionId]) {
        chatStore.sessionMetadata[sessionId].lastActivity = new Date().toISOString()
      }
      
      notify()
    }
  }

  const getCurrentMessages = () => {
    if (!chatStore.currentSessionId || !chatStore.sessions[chatStore.currentSessionId]) {
      return []
    }
    return chatStore.sessions[chatStore.currentSessionId]
  }

  const getAllSessions = () => {
    return Object.keys(chatStore.sessions).map(sessionId => ({
      id: sessionId,
      messages: chatStore.sessions[sessionId],
      metadata: chatStore.sessionMetadata[sessionId] || {
        title: 'Untitled Chat',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: chatStore.sessions[sessionId].length
      }
    })).sort((a, b) => new Date(b.metadata.lastActivity) - new Date(a.metadata.lastActivity))
  }

  const getSessionMetadata = (sessionId) => {
    return chatStore.sessionMetadata[sessionId] || null
  }

  return {
    sessions: chatStore.sessions,
    sessionMetadata: chatStore.sessionMetadata,
    currentSessionId: chatStore.currentSessionId,
    createNewSession,
    switchToSession,
    deleteSession,
    updateSessionTitle,
    clearCurrentSession,
    addMessageToCurrentSession,
    updateLastMessage,
    getCurrentMessages,
    getAllSessions,
    getSessionMetadata
  }
}

export function loadState(key, fallback) {
  try {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

export default useChatStore