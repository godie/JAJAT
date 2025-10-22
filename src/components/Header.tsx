// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { checkLoginStatus, setLoginStatus } from '../utils/localStorage';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect (() => {
    setIsLoggedIn(checkLoginStatus());
    window.handleCredentialResponse = (response) => {
      console.log("Token JWT recibido:", response.credential);
      setLoginStatus(true);
      setIsLoggedIn(true);
      alert("Successful Login with Google!");
    };

    if (!checkLoginStatus() && window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID, // Usar tu CLIENT ID real
        callback: window.handleCredentialResponse, // La función que maneja la respuesta
        auto_select: false, // Evita login automático
      });
    }
  },[]);

  const handleAuth = () => {
    if (isLoggedIn) {
      setLoginStatus(false);
      setIsLoggedIn(false);
      alert("Logged out successfully!");
    }
    else{
      if (window.google) {
        window.google.accounts.id.prompt(); // Muestra el cuadro de diálogo de inicio de sesión
      } else {
        alert("Google Identity Services not loaded yet. Please try again.");
      }
    }
    
  };
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
      <h1 className="text-3xl font-extrabold text-indigo-700" data-testid="app-title">
        Just Another Job Application Tracker
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