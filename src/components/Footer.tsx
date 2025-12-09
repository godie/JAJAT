import React from 'react';

interface FooterProps {
  version: string;
}

const Footer: React.FC<FooterProps> = ({ version }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600">
          Vibecoded with love ❤️ by <a className="text-blue-500 hover:text-blue-700" href="https://github.com/godie" target="_blank" rel="noopener noreferrer">godie</a> with cursor v{version} ({currentYear})
        </p>
        <p className="text-center text-xs text-gray-500 mt-2">
          <a className="text-gray-500 hover:text-gray-700" href="/privacy.html" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

