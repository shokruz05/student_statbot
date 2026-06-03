import { AppProvider, useApp } from './context';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import QuizzesPage from './pages/QuizzesPage';
import AddResultPage from './pages/AddResultPage';
import StatisticsPage from './pages/StatisticsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import QuizDetailPage from './pages/QuizDetailPage';

function Router() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'login':
      return <LoginPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'students':
      return <StudentsPage />;
    case 'quizzes':
      return <QuizzesPage />;
    case 'add-result':
      return <AddResultPage />;
    case 'statistics':
      return <StatisticsPage />;
    case 'student-detail':
      return <StudentDetailPage />;
    case 'quiz-detail':
      return <QuizDetailPage />;
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="relative min-h-screen">
        {/* Watermark background */}
        <div className="watermark-bg" />
        
        {/* Main content */}
        <div className="relative z-10">
          <Router />
        </div>

        {/* Watermark footer */}
        <div className="watermark">
          developed by @kvonyeon
        </div>
      </div>
    </AppProvider>
  );
}
