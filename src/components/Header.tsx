// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { checkLoginStatus, setLoginStatus, getOpportunities } from '../utils/localStorage';
import { type PageType } from '../App';
import { setAuthCookie, clearAuthCookie } from '../utils/api';
import { useAlert } from './AlertProvider';

interface HeaderProps {
  onNavigate?: (page: PageType) => void;
  currentPage?: PageType;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage = 'applications' }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    setIsLoggedIn(checkLoginStatus());
    updateOpportunitiesCount();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobOpportunities' || e.key === null) {
        updateOpportunitiesCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes (in case extension uses chrome.storage.local)
    const interval = setInterval(updateOpportunitiesCount, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const updateOpportunitiesCount = () => {
    setOpportunitiesCount(getOpportunities().length);
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
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-700" data-testid="app-title">
        Just Another Job Application Tracker
      </h1>
      <div className="flex items-center gap-3">
        {onNavigate && (
          <nav className="flex gap-2">
            <button
              onClick={() => onNavigate('applications')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-150 ${
                currentPage === 'applications'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => onNavigate('opportunities')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-150 relative ${
                currentPage === 'opportunities'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Opportunities
              {opportunitiesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {opportunitiesCount > 9 ? '9+' : opportunitiesCount}
                </span>
              )}
            </button>
          </nav>
        )}
        <button 
          className={`self-start sm:self-auto font-medium py-2 px-5 rounded-lg shadow-md transition duration-150 transform hover:scale-[1.02] ${
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
};

export default Header;