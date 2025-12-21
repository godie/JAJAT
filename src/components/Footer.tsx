import React from 'react';

interface FooterProps {
  version: string;
}

const Footer: React.FC<FooterProps> = ({ version }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Vibecoded with love ❤️ by <a className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" href="https://github.com/godie" target="_blank" rel="noopener noreferrer">godie</a> with cursor v{version} ({currentYear})
        </p>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <a className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" href="/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          {' | '}
          <a className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

