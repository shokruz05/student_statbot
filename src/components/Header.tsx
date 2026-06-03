import React from 'react';
import { useData } from '../context/DataContext';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, showBack = false }) => {
  const { teacher } = useData();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {teacher && (
                <p className="text-xs text-indigo-200 mt-0.5">
                  @{teacher.username} • ID: {teacher.teacher_id}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg">👨‍🏫</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
