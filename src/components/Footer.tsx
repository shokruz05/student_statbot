import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div className="px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">📊</span>
          <span className="font-semibold text-white">O'quvchilar Statistikasi</span>
        </div>
        <p className="text-sm mb-3">
          Matematika o'qituvchilari uchun professional boshqaruv tizimi
        </p>
        <div className="flex items-center justify-center gap-2 text-indigo-400">
          <span>💻</span>
          <span className="text-sm">Dasturchi:</span>
          <a 
            href="https://t.me/kvonyeon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:text-indigo-300 transition-colors"
          >
            @kvonyeon
          </a>
        </div>
        <p className="text-xs mt-3 text-gray-500">
          © 2024 • Barcha huquqlar himoyalangan
        </p>
      </div>
    </footer>
  );
};

export default Footer;
