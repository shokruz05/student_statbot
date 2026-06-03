import { useApp } from '../context';
import { getStudentsByTeacher, getQuizzesByTeacher, getResultsByTeacher, getStudentAveragePercent } from '../db';

export default function DashboardPage() {
  const { currentTeacher, navigate, logout, refreshKey } = useApp();
  if (!currentTeacher) return null;

  // Force re-read on refreshKey change
  void refreshKey;

  const students = getStudentsByTeacher(currentTeacher.id);
  const quizzes = getQuizzesByTeacher(currentTeacher.id);
  const results = getResultsByTeacher(currentTeacher.id);

  // Calculate overall average
  let overallAvg = 0;
  if (students.length > 0) {
    const avgs = students
      .map((s) => getStudentAveragePercent(s.id))
      .filter((a) => a.count > 0);
    if (avgs.length > 0) {
      overallAvg =
        Math.round(
          (avgs.reduce((sum, a) => sum + a.average, 0) / avgs.length) * 10
        ) / 10;
    }
  }

  const menuItems = [
    {
      icon: '➕',
      title: "Natija qo'shish",
      subtitle: "Nazorat ishi natijalarini kiritish",
      color: 'from-green-500 to-emerald-600',
      page: 'add-result' as const,
      badge: null,
    },
    {
      icon: '📊',
      title: 'Statistika',
      subtitle: "Umumiy ko'rsatkichlar va tahlil",
      color: 'from-blue-500 to-indigo-600',
      page: 'statistics' as const,
      badge: null,
    },
    {
      icon: '👥',
      title: "O'quvchilar",
      subtitle: `${students.length} ta o'quvchi ro'yxatda`,
      color: 'from-purple-500 to-violet-600',
      page: 'students' as const,
      badge: students.length,
    },
    {
      icon: '📝',
      title: 'Nazorat ishlari',
      subtitle: `${quizzes.length} ta nazorat ishi`,
      color: 'from-amber-500 to-orange-600',
      page: 'quizzes' as const,
      badge: quizzes.length,
    },
  ];

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-white">
              Assalomu alaykum! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {currentTeacher.fullName}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all text-slate-400 hover:text-white"
            title="Chiqish"
          >
            🚪
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{students.length}</div>
            <div className="text-slate-400 text-xs mt-1">O'quvchilar</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{quizzes.length}</div>
            <div className="text-slate-400 text-xs mt-1">Nazorat ishlari</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${overallAvg >= 70 ? 'text-success-400' : overallAvg >= 50 ? 'text-warn-400' : results.length > 0 ? 'text-danger-400' : 'text-slate-400'}`}>
              {results.length > 0 ? `${overallAvg}%` : '—'}
            </div>
            <div className="text-slate-400 text-xs mt-1">O'rtacha ball</div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-700/40 transition-all active:scale-[0.98] group animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}
              >
                {item.icon}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-white font-semibold">{item.title}</div>
                <div className="text-slate-400 text-sm truncate">{item.subtitle}</div>
              </div>
              {item.badge !== null && (
                <span className="bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
              <span className="text-slate-500 group-hover:text-primary-400 transition-colors text-lg ml-1">
                →
              </span>
            </button>
          ))}
        </div>

        {/* Developer info */}
        <div className="mt-8 text-center">
          <div className="glass-card inline-block rounded-full px-4 py-2">
            <span className="text-slate-500 text-xs">
              Bot: <span className="text-slate-400">@students_statbot</span> · Dev: <span className="text-slate-400">@kvonyeon</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
