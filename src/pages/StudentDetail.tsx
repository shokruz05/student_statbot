import React from 'react';
import { useData } from '../context/DataContext';
import { ViewType } from '../types';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

interface StudentDetailProps {
  studentId: number;
  onNavigate: (view: ViewType) => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ studentId, onNavigate }) => {
  const { students, getStudentStats } = useData();
  
  const student = students.find(s => s.student_id === studentId);
  const stats = student ? getStudentStats(student.student_id) : null;

  if (!student || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header title="O'quvchi" showBack onBack={() => onNavigate('students')} />
        <EmptyState
          icon="❓"
          title="O'quvchi topilmadi"
          description="Bu o'quvchi mavjud emas yoki o'chirilgan"
        />
      </div>
    );
  }

  const getGradeColor = (percent: number) => {
    if (percent >= 80) return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
    if (percent >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' };
    return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
  };

  const getGradeLabel = (percent: number) => {
    if (percent >= 90) return 'A\'lo';
    if (percent >= 80) return 'Yaxshi';
    if (percent >= 60) return 'Qoniqarli';
    return 'Qoniqarsiz';
  };

  const overallColors = getGradeColor(stats.averagePercent);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="O'quvchi Ma'lumotlari" showBack onBack={() => onNavigate('students')} />

      <div className="px-4 py-6">
        {/* Student Info Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold">{student.full_name}</h2>
              <p className="text-indigo-200 text-sm">O'quvchi profili</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-indigo-200 text-xs">Jami ishlar</p>
              <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-indigo-200 text-xs">O'rtacha</p>
              <p className="text-2xl font-bold">{stats.averagePercent}%</p>
            </div>
          </div>
        </div>

        {/* Overall Grade */}
        <div className={`${overallColors.bg} rounded-xl p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${overallColors.text}`}>Umumiy baho</p>
              <p className={`text-2xl font-bold ${overallColors.text}`}>
                {getGradeLabel(stats.averagePercent)}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full ${overallColors.bar} flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">{stats.averagePercent}%</span>
            </div>
          </div>
        </div>

        {/* Results History */}
        {stats.results.length === 0 ? (
          <EmptyState
            icon="📊"
            title="Natijalar yo'q"
            description="Bu o'quvchi uchun hali natija kiritilmagan"
            actionLabel="Natija qo'shish"
            onAction={() => onNavigate('add-result')}
          />
        ) : (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Barcha natijalar</h3>
            <div className="space-y-3">
              {stats.results
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(result => {
                  const colors = getGradeColor(result.percent);
                  return (
                    <div
                      key={result.result_id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{result.quiz_name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(result.created_at).toLocaleDateString('uz-UZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${colors.bg}`}>
                          <span className={`font-bold ${colors.text}`}>{result.percent}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-500">Ball</span>
                        <span className="font-semibold text-gray-800">
                          {result.score} / {result.max_score}
                        </span>
                      </div>
                      
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all`}
                          style={{ width: `${result.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Footer Credit */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💻 Dasturchi: <span className="font-semibold text-indigo-600">@kvonyeon</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
