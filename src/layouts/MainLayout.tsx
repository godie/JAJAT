// src/layouts/MainLayout.tsx
import React from 'react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar will be added here */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default MainLayout;
