// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { checkLoginStatus, setLoginStatus } from '../utils/localStorage';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect (() => {
    const status = checkLoginStatus();
    setIsLoggedIn(status);
  },[]);

  const handleAuth = () => {
    const newStatus = !isLoggedIn;
    setLoginStatus(newStatus);
    setIsLoggedIn(newStatus);
    alert(newStatus ? "Logged in with Google (Simulated)" : "Logged out (Simulated)");
  };
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
      <h1 className="text-3xl font-extrabold text-indigo-700" data-testid="app-title">
        Job Application Tracker
      </h1>
      <button 
        className={`font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 transform hover:scale-[1.02] ${
          isLoggedIn 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        onClick={handleAuth}
        data-testid="login-button"
        aria-label={isLoggedIn ? "Logout" : "Login with Google"}
      >
        {isLoggedIn ? "Logout" : "Login with Google"}
      </button>
    </header>
  );
};

export default Header;