import React, { createContext, useContext, useState, useEffect } from 'react';
import { theme } from 'antd';

// LIGHT THEME COLORS
const defaultLightTheme = {
  colorPrimary: '#1677ff',
  colorBgContainer: '#ffffff',
  colorBgLayout: '#f0f2f5',
  colorText: '#000000',          // Black Text
  colorTextSecondary: '#666666', // Grey Text
  isDark: false
};

// DARK THEME COLORS (UPDATED FOR HIGH CONTRAST)
const defaultDarkTheme = {
  colorPrimary: '#1677ff',
  colorBgContainer: '#141414',   // Dark Card
  colorBgLayout: '#000000',      // Pitch Black Background
  colorText: '#ffffff',          // Pure White Text (IMPORTANT)
  colorTextSecondary: '#a6a6a6', // Light Grey for description
  isDark: true
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // LocalStorage nundi theme load cheyyadam
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const [lightTheme, setLightTheme] = useState(() => {
    const saved = localStorage.getItem('lightTheme');
    return saved ? JSON.parse(saved) : defaultLightTheme;
  });
  
  const [darkTheme, setDarkTheme] = useState(() => {
    const saved = localStorage.getItem('darkTheme');
    return saved ? JSON.parse(saved) : defaultDarkTheme;
  });

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const updateLightTheme = (newTheme) => {
    setLightTheme(newTheme);
    localStorage.setItem('lightTheme', JSON.stringify(newTheme));
  };

  const updateDarkTheme = (newTheme) => {
    setDarkTheme(newTheme);
    localStorage.setItem('darkTheme', JSON.stringify(newTheme));
  };

  const resetThemes = () => {
    setLightTheme(defaultLightTheme);
    setDarkTheme(defaultDarkTheme);
    localStorage.removeItem('lightTheme');
    localStorage.removeItem('darkTheme');
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      currentTheme,
      lightTheme,
      darkTheme,
      toggleTheme,
      updateLightTheme,
      updateDarkTheme,
      resetThemes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};