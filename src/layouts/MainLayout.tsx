// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { type PageType } from '../App';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage?: PageType;
  onNavigate?: (page: PageType) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const headerRef = React.useRef<HTMLHeadElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [children]); // Re-calculate on children change, e.g., page navigation

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header always on top, full width */}
      <Header onToggleSidebar={toggleSidebar} ref={headerRef} />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: headerHeight }}>
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          isOpen={isSidebarOpen}
          headerHeight={headerHeight}
        />
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
            style={{ top: headerHeight }}
          />
        )}
        <div 
          className={`flex-1 overflow-hidden bg-white dark:bg-gray-900 transition-all duration-300 ${
            isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
          }`}
        >
          <main className="h-full overflow-y-auto p-8 bg-white dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
