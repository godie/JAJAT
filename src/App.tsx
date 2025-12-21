// src/App.tsx
import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import SettingsPage from './pages/SettingsPage';
import InsightsPage from './pages/InsightsPage';
import MainLayout from './layouts/MainLayout';
import Sidebar from './components/Sidebar';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export type PageType = 'applications' | 'opportunities' | 'settings' | 'insights';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('applications');

  useEffect(() => {
    // Load page preference from localStorage
    const savedPage = localStorage.getItem('currentPage') as PageType | null;
    if (savedPage) {
      setCurrentPage(savedPage);
    }
  }, []);

  useEffect(() => {
    // Save page preference
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'applications':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'opportunities':
        return <OpportunitiesPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      case 'insights':
        return <InsightsPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <MainLayout>
        <Sidebar />
        <div className="flex-1 p-8">
          {renderPage()}
        </div>
      </MainLayout>
    </GoogleOAuthProvider>
  );
}

export default App;
