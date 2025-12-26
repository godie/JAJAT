// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { type PageType } from '../App';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage?: PageType;
  onNavigate?: (page: PageType) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load sidebar preference from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setIsSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

  // Save sidebar preference
  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header always on top, full width */}
      <Header onToggleSidebar={toggleSidebar} />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden mt-16">
        <div className="hidden md:block">
          <Sidebar
            currentPage={currentPage}
            onNavigate={onNavigate}
            isOpen={isSidebarOpen}
          />
        </div>
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden mt-16"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        <div 
          className={`flex-1 overflow-hidden bg-white dark:bg-gray-900 transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <main className="h-full overflow-y-auto p-8 bg-white dark:bg-gray-900 pb-16 md:pb-8">
            {children}
          </main>
        </div>
      </div>
      <BottomNav currentPage={currentPage as PageType} onNavigate={onNavigate as (page: PageType) => void} />
    </div>
  );
};

export default MainLayout;
