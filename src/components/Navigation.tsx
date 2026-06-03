import React from 'react';
import { ViewType } from '../types';

interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: 'dashboard' as ViewType, icon: '🏠', label: 'Bosh sahifa' },
    { view: 'add-result' as ViewType, icon: '➕', label: 'Natija' },
    { view: 'students' as ViewType, icon: '👥', label: 'O\'quvchilar' },
    { view: 'new-quiz' as ViewType, icon: '📝', label: 'Nazorat' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ view, icon, label }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
              currentView === view
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-indigo-500 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
