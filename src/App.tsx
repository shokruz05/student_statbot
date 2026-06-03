import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { ViewType } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import AddResult from './pages/AddResult';
import Students from './pages/Students';
import NewQuiz from './pages/NewQuiz';
import DeleteQuiz from './pages/DeleteQuiz';
import StudentDetail from './pages/StudentDetail';

// Telegram WebApp integration
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
          };
        };
      };
    };
  }
}

const AppContent: React.FC = () => {
  const { isLoading } = useData();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Initialize Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  // Handle navigation
  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    setSelectedStudentId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle student selection
  const handleSelectStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'add-result':
        return <AddResult onNavigate={handleNavigate} />;
      case 'students':
        return <Students onNavigate={handleNavigate} onSelectStudent={handleSelectStudent} />;
      case 'new-quiz':
        return <NewQuiz onNavigate={handleNavigate} />;
      case 'delete-quiz':
        return <DeleteQuiz onNavigate={handleNavigate} />;
      case 'student-detail':
        if (selectedStudentId) {
          return <StudentDetail studentId={selectedStudentId} onNavigate={handleNavigate} />;
        }
        return <Dashboard onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="animate-fade-in">
        {renderView()}
      </main>
      <Navigation currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
