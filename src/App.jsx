import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { authService } from './services/auth.service';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}

export default App;