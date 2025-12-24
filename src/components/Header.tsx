// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { checkLoginStatus, setLoginStatus } from '../utils/localStorage';
import { setAuthCookie, clearAuthCookie } from '../utils/api';
import { useAlert } from './AlertProvider';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = React.forwardRef<HTMLHeadElement, HeaderProps>(({ onToggleSidebar }, ref) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      return savedTheme || 'light';
    }
    return 'light';
  });
  const [mounted, setMounted] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    setIsLoggedIn(checkLoginStatus());
  }, []);

  // Initialize theme on mount - sync with what was applied by the inline script
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const currentTheme = isDark ? 'dark' : 'light';
    setTheme(currentTheme);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Force immediate update
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets',
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      
      try {
        // Store token in secure cookie via PHP backend
        await setAuthCookie(tokenResponse.access_token);
        
        // Also store login status in localStorage for UI state
        setLoginStatus(true);
        setIsLoggedIn(true);
        showSuccess("Successful Login with Google!");
      } catch (error) {
        console.error("Error storing auth cookie:", error);
        showError("Login successful but failed to store credentials securely.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Error en el login:", error);
      showError("Failed to login with Google. Please try again.");
    },
  });

  const handleAuth = async () => {
    if (isLoggedIn) {
      setIsLoading(true);
      
      try {
        // Clear cookie via PHP backend
        await clearAuthCookie();
        
        // Clear localStorage
        setLoginStatus(false);
        setIsLoggedIn(false);
        showSuccess("Logged out successfully!");
      } catch (error) {
        console.error("Error clearing auth cookie:", error);
        // Still clear localStorage even if backend call fails
        setLoginStatus(false);
        setIsLoggedIn(false);
        showError("Logged out (some credentials may remain on server).");
      } finally {
        setIsLoading(false);
      }
    } else {
      googleLogin();
    }
  };

  return (
    <header ref={ref} className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 h-auto sm:h-16">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Hamburger menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
          aria-label="Toggle sidebar"
          data-testid="sidebar-toggle"
        >
          <svg
            className="w-6 h-6 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-lg sm:text-2xl font-extrabold text-indigo-700 dark:text-indigo-400" data-testid="app-title">
          Just Another Job Application Tracker
        </h1>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-4 sm:mt-0">
        {/* Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Sun Icon (Light Mode) */}
          <svg
            className={`w-5 h-5 transition-colors ${
              theme === 'light' ? 'text-yellow-500' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>

          {/* Toggle Switch */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Toggle theme"
            data-testid="theme-toggle"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          {/* Moon Icon (Dark Mode) */}
          <svg
            className={`w-5 h-5 transition-colors ${
              theme === 'dark' ? 'text-indigo-400' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
        {/* Login/Logout Button */}
        <button 
          className={`font-medium py-2 px-5 rounded-lg shadow-md transition duration-150 transform hover:scale-[1.02] ${
            isLoggedIn 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleAuth}
          data-testid="login-button"
          aria-label={isLoggedIn ? "Logout" : "Login with Google"}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : isLoggedIn ? "Logout" : "Login with Google"}
        </button>
      </div>
    </header>
  );
});

export default Header;