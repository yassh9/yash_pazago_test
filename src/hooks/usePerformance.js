import { useCallback, useRef, useEffect, useState, useMemo } from 'react';

/**
 * Custom hook for debouncing functions
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Custom hook for throttling functions
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const useThrottle = (callback, delay) => {
  const timeoutRef = useRef(null);
  const lastExecuted = useRef(0);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastExecuted.current >= delay) {
      callback(...args);
      lastExecuted.current = now;
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastExecuted.current = Date.now();
        timeoutRef.current = null;
      }, delay - (now - lastExecuted.current));
    }
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for local storage with performance optimization
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {[any, Function]} Current value and setter function
 */
export const useLocalStorage = (key, initialValue) => {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Debounced setter to avoid excessive localStorage writes
  const debouncedSetValue = useDebounce((value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, 300);

  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      debouncedSetValue(valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, debouncedSetValue]);

  return [storedValue, setValue];
};

/**
 * Custom hook for auto-resizing textarea
 * @param {number} minHeight - Minimum height in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @returns {Function} Resize function
 */
export const useAutoResize = (minHeight = 48, maxHeight = 120) => {
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }
  }, [minHeight, maxHeight]);

  const debouncedResize = useDebounce(resize, 10);

  return { textareaRef, resize: debouncedResize };
};

/**
 * Custom hook for memoizing expensive calculations
 * @param {Function} factory - Function that returns the value to memoize
 * @param {Array} deps - Dependencies array
 * @returns {any} Memoized value
 */
export const useMemoizedCallback = (factory, deps) => {
  return useMemo(factory, deps);
};

/**
 * Custom hook for performance monitoring
 * @param {string} componentName - Name of the component for logging
 * @returns {Function} Mark function for timing
 */
export const usePerformanceMonitor = (componentName) => {
  const mark = useCallback((label) => {
    if (process.env.NODE_ENV === 'development') {
      const markName = `${componentName}-${label}`;
      performance.mark(markName);
      
      return () => {
        const endMarkName = `${markName}-end`;
        performance.mark(endMarkName);
        performance.measure(`${markName}-duration`, markName, endMarkName);
        
        const measures = performance.getEntriesByName(`${markName}-duration`);
        if (measures.length > 0) {
          console.log(`${componentName} ${label}:`, `${measures[0].duration.toFixed(2)}ms`);
        }
      };
    }
    return () => {}; // No-op in production
  }, [componentName]);

  return mark;
};