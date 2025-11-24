// src/App.tsx
import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import SettingsPage from './pages/SettingsPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export type PageType = 'applications' | 'opportunities' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('applications');

  useEffect(() => {
    // Load page preference from localStorage
    const savedPage = localStorage.getItem('currentPage') as PageType | null;
    if (savedPage === 'applications' || savedPage === 'opportunities' || savedPage === 'settings') {
      setCurrentPage(savedPage);
    }
  }, []);

  useEffect(() => {
    // Save page preference
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {currentPage === 'applications' && (
        <HomePage onNavigate={setCurrentPage} />
      )}
      {currentPage === 'opportunities' && (
        <OpportunitiesPage onNavigate={setCurrentPage} />
      )}
      {currentPage === 'settings' && (
        <SettingsPage onNavigate={setCurrentPage} />
      )}
    </GoogleOAuthProvider>
  );
}

export default App;