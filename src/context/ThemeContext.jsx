import React, { createContext, useContext, useState } from 'react';

// --- DEVELOPER COLOR CONFIGURATION ---
// Change these hex codes to whatever you like!

const defaultLightTheme = {
  colorPrimary: '#1677ff',       // Your Primary Blue
  colorBgContainer: '#ffffff',   // White Card Background
  colorBgLayout: '#f0f2f5',      // Light Grey Background
  colorText: '#000000',          // Black Text
  colorTextSecondary: '#666666', // Grey Text
  isDark: false
};

const defaultDarkTheme = {
  colorPrimary: '#1677ff',       // Keep Blue or change to Gold/Purple
  colorBgContainer: '#141414',   // Dark Card Background
  colorBgLayout: '#000000',      // Pitch Black Background
  colorText: '#ffffff',          // White Text
  colorTextSecondary: '#a6a6a6', // Light Grey Text
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
  // Only keep Dark Mode toggle logic
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Use the hardcoded themes directly
  const currentTheme = isDarkMode ? defaultDarkTheme : defaultLightTheme;

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      currentTheme,
      toggleTheme // Users can still toggle Light/Dark mode via Navbar if you want
    }}>
      {children}
    </ThemeContext.Provider>
  );
};