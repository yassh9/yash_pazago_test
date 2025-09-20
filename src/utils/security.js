/**
 * Security utilities for input validation and sanitization
 */

// Simple input sanitization (remove HTML tags and script content)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Validate message input
export const validateMessage = (message) => {
  const errors = [];
  
  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
    return { isValid: false, errors };
  }
  
  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    errors.push('Message cannot be empty');
  }
  
  if (trimmed.length > 500) {
    errors.push('Message cannot exceed 500 characters');
  }
  
  if (trimmed.length < 1) {
    errors.push('Message must be at least 1 character long');
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      errors.push('Message contains potentially unsafe content');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: sanitizeInput(trimmed)
  };
};

// Rate limiting for message sending
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) { // 10 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  isAllowed() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if under limit
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
  
  getRemainingTime() {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const timeRemaining = this.windowMs - (Date.now() - oldestRequest);
    
    return Math.max(0, timeRemaining);
  }
}

export const messageLimiter = new RateLimiter();

// Encrypt sensitive data for localStorage
export const encryptData = (data, key = 'weather-chat-app') => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple XOR encryption (for demo purposes - use proper encryption in production)
    let encrypted = '';
    for (let i = 0; i < jsonString.length; i++) {
      encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted); // Base64 encode
  } catch (error) {
    console.error('Encryption failed:', error);
    return data;
  }
};

// Decrypt data from localStorage
export const decryptData = (encryptedData, key = 'weather-chat-app') => {
  try {
    const encrypted = atob(encryptedData); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};