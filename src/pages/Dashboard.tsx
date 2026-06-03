import React from 'react';
import { useData } from '../context/DataContext';
import { ViewType } from '../types';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import Footer from '../components/Footer';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { students, getAllQuizzesWithStats, getOverallStats, getStudentStats } = useData();
  const stats = getOverallStats();
  const quizzesWithStats = getAllQuizzesWithStats();

  // Get top performers
  const topPerformers = React.useMemo(() => {
    return students
      .map(student => ({
        ...student,
        stats: getStudentStats(student.student_id),
      }))
      .filter(s => s.stats.totalQuizzes > 0)
      .sort((a, b) => b.stats.averagePercent - a.stats.averagePercent)
      .slice(0, 5);
  }, [students, getStudentStats]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Bosh Sahifa" />
      
      {/* Welcome Banner */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Xush kelibsiz! 👋</h2>
              <p className="text-indigo-100 text-sm">
                O'quvchilar natijalarini oson boshqaring
              </p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs text-indigo-200">
              💻 Dasturchi: <span className="font-semibold text-white">@kvonyeon</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Umumiy Statistika</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="👥"
            label="O'quvchilar"
            value={stats.totalStudents}
            subValue="Ro'yxatda"
            color="blue"
            onClick={() => onNavigate('students')}
          />
          <StatCard
            icon="📝"
            label="Nazorat ishlari"
            value={stats.totalQuizzes}
            subValue="Jami"
            color="purple"
            onClick={() => onNavigate('new-quiz')}
          />
          <StatCard
            icon="✅"
            label="Natijalar"
            value={stats.totalResults}
            subValue="Kiritilgan"
            color="green"
            onClick={() => onNavigate('add-result')}
          />
          <StatCard
            icon="📈"
            label="O'rtacha"
            value={`${stats.averagePercent}%`}
            subValue="O'zlashtirish"
            color="orange"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">⚡ Tezkor Amallar</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('add-result')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-xl">➕</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Natija qo'shish</p>
              <p className="text-xs text-gray-500">Yangi ball kiritish</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate('new-quiz')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Yangi nazorat</p>
              <p className="text-xs text-gray-500">Ish yaratish</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">O'quvchilar</p>
              <p className="text-xs text-gray-500">Ro'yxatni ko'rish</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate('delete-quiz')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-xl">🗑</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">O'chirish</p>
              <p className="text-xs text-gray-500">Nazorat ishini</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Quizzes */}
      {quizzesWithStats.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Nazorat Ishlari</h3>
          <div className="space-y-3">
            {quizzesWithStats.slice(0, 5).map(quiz => (
              <div
                key={quiz.quiz_id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{quiz.quiz_name}</h4>
                    <p className="text-sm text-gray-500">
                      Maksimum: {quiz.max_score} ball
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{quiz.averagePercent}%</p>
                    <p className="text-xs text-gray-500">
                      {quiz.totalStudents} ta natija
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${quiz.averagePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Eng Yaxshi Natijalar</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {topPerformers.map((student, index) => (
              <div
                key={student.student_id}
                className={`flex items-center gap-3 p-4 ${
                  index !== topPerformers.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{student.full_name}</p>
                  <p className="text-xs text-gray-500">
                    {student.stats.totalQuizzes} ta ish topshirilgan
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  student.stats.averagePercent >= 80 ? 'bg-green-100 text-green-700' :
                  student.stats.averagePercent >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {student.stats.averagePercent}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
