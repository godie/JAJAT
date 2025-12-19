// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';

const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="w-64 h-full bg-secondary-light dark:bg-secondary-dark p-4">
      <nav>
        <ul>
          <li className="mb-4">
            <a href="#" className="text-lg font-semibold text-text-light dark:text-text-dark hover:text-gray-900 dark:hover:text-gray-100">
              Applications
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="text-lg font-semibold text-text-light dark:text-text-dark hover:text-gray-900 dark:hover:text-gray-100">
              Opportunities
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="text-lg font-semibold text-text-light dark:text-text-dark hover:text-gray-900 dark:hover:text-gray-100">
              Settings
            </a>
          </li>
          <li>
            <a href="#" className="text-lg font-semibold text-text-light dark:text-text-dark hover:text-gray-900 dark:hover:text-gray-100">
              Insights
            </a>
          </li>
        </ul>
      </nav>
      <button
        onClick={toggleTheme}
        className="mt-8 bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark py-2 px-4 rounded"
        aria-label="toggle theme"
      >
        Toggle Theme
      </button>
    </div>
  );
};

export default Sidebar;
