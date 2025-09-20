import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, default to light mode if no preference saved
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to light mode instead of system preference
    return false;
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark]);

  const colors = useMemo(() => ({
    // Background colors
    bg: {
      primary: isDark ? 'bg-gray-900' : 'bg-gray-50',
      secondary: isDark ? 'bg-gray-800' : 'bg-white',
      tertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      card: isDark ? 'bg-gray-800' : 'bg-white',
      input: isDark ? 'bg-gray-700' : 'bg-white',
      modal: isDark ? 'bg-gray-800' : 'bg-white',
    },
    // Text colors
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-300' : 'text-gray-600',
      tertiary: isDark ? 'text-gray-400' : 'text-gray-500',
      muted: isDark ? 'text-gray-500' : 'text-gray-400',
      inverse: isDark ? 'text-gray-900' : 'text-white',
    },
    // Border colors
    border: {
      primary: isDark ? 'border-gray-700' : 'border-gray-200',
      secondary: isDark ? 'border-gray-600' : 'border-gray-300',
      focus: 'border-blue-500',
    },
    // Message colors
    message: {
      user: 'bg-white text-gray-900',
      bot: isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800',
      userHover: 'hover:bg-gray-50',
      botHover: isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-300',
    },
    // Button colors
    button: {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white',
      secondary: isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      ghost: isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600',
    },
    // Sidebar colors
    sidebar: {
      bg: isDark ? 'bg-gray-900' : 'bg-white',
      item: isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
      active: isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200',
      activeText: isDark ? 'text-blue-300' : 'text-blue-700',
    },
  }), [isDark]);

  const theme = useMemo(() => ({
    isDark,
    toggleTheme,
    colors
  }), [isDark, toggleTheme, colors]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};