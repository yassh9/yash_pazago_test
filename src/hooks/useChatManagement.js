import { useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useToast } from '../components/Toast';
import { generateThreadId } from '../utils/threadId';

/**
 * Custom hook for enhanced chat management
 */
export const useChatManagement = () => {
  const {
    threads,
    selectedThreadId,
    archivedThreads,
    createThread,
    deleteThread,
    archiveThread,
    clearThread,
    setSelectedThread,
    addMessage
  } = useChat();
  
  const { success, error, info } = useToast();

  // Enhanced create thread with validation
  const createNewThread = useCallback((initialMessage = null) => {
    try {
      const threadId = generateThreadId();
      const initialMessages = initialMessage ? [initialMessage] : [];
      
      createThread(threadId, initialMessages);
      setSelectedThread(threadId);
      
      success('New chat created!');
      return threadId;
    } catch (err) {
      error('Failed to create new chat');
      console.error('Error creating thread:', err);
      return null;
    }
  }, [createThread, setSelectedThread, success, error]);

  // Enhanced delete with confirmation and feedback
  const deleteThreadWithConfirmation = useCallback((threadId) => {
    try {
      deleteThread(threadId);
      success('Chat deleted successfully');
    } catch (err) {
      error('Failed to delete chat');
      console.error('Error deleting thread:', err);
    }
  }, [deleteThread, success, error]);

  // Archive thread with feedback
  const archiveThreadWithFeedback = useCallback((threadId) => {
    try {
      archiveThread(threadId);
      info('Chat archived');
    } catch (err) {
      error('Failed to archive chat');
      console.error('Error archiving thread:', err);
    }
  }, [archiveThread, info, error]);

  // Clear thread with feedback
  const clearThreadWithFeedback = useCallback((threadId) => {
    try {
      clearThread(threadId);
      success('Chat cleared');
    } catch (err) {
      error('Failed to clear chat');
      console.error('Error clearing thread:', err);
    }
  }, [clearThread, success, error]);

  // Get thread title from messages
  const getThreadTitle = useCallback((messages) => {
    if (!messages || messages.length === 0) return "New chat";
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (!firstUserMsg) return "New chat";
    const title = firstUserMsg.content.trim().slice(0, 30);
    return title.length < firstUserMsg.content.trim().length ? title + "..." : title;
  }, []);

  // Search through threads
  const searchThreads = useCallback((query) => {
    if (!query.trim()) return threads;
    
    const lowercaseQuery = query.toLowerCase();
    const filteredThreads = {};
    
    Object.entries(threads).forEach(([id, messages]) => {
      const title = getThreadTitle(messages).toLowerCase();
      const hasMatchingMessage = messages.some(msg => 
        msg.content.toLowerCase().includes(lowercaseQuery)
      );
      
      if (title.includes(lowercaseQuery) || hasMatchingMessage) {
        filteredThreads[id] = messages;
      }
    });
    
    return filteredThreads;
  }, [threads, getThreadTitle]);

  // Get chat statistics
  const getChatStats = useCallback(() => {
    const totalThreads = Object.keys(threads).length;
    const archivedCount = Object.keys(archivedThreads).length;
    const totalMessages = Object.values(threads).reduce((total, messages) => 
      total + messages.length, 0
    );
    
    return {
      totalThreads,
      archivedCount,
      totalMessages,
      activeThreads: totalThreads
    };
  }, [threads, archivedThreads]);

  // Export chat data
  const exportChat = useCallback((threadId, format = 'json') => {
    try {
      const messages = threads[threadId] || [];
      const title = getThreadTitle(messages);
      
      let exportData;
      let mimeType;
      let fileName;
      
      switch (format) {
        case 'txt':
          exportData = `Chat: ${title}\n\n` + 
            messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
          mimeType = 'text/plain';
          fileName = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
          break;
          
        case 'json':
        default:
          exportData = JSON.stringify({
            title,
            messages,
            exportedAt: new Date().toISOString()
          }, null, 2);
          mimeType = 'application/json';
          fileName = `${title.replace(/[^a-z0-9]/gi, '_')}.json`;
          break;
      }
      
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      success(`Chat exported as ${format.toUpperCase()}`);
    } catch (err) {
      error('Failed to export chat');
      console.error('Error exporting chat:', err);
    }
  }, [threads, getThreadTitle, success, error]);

  return {
    // Basic operations
    createNewThread,
    deleteThreadWithConfirmation,
    archiveThreadWithFeedback,
    clearThreadWithFeedback,
    
    // Utility functions
    getThreadTitle,
    searchThreads,
    getChatStats,
    exportChat,
    
    // Data
    threads,
    selectedThreadId,
    archivedThreads
  };
};