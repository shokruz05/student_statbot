import { useApp } from '../context';
import {
  getStudentsByTeacher,
  getQuizzesByTeacher,
  getResultsByTeacher,
  getStudentAveragePercent,
  getQuizStats,
  getResultsByQuiz,
} from '../db';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function StatisticsPage() {
  const { currentTeacher, navigate, refreshKey } = useApp();
  if (!currentTeacher) return null;

  void refreshKey;

  const students = getStudentsByTeacher(currentTeacher.id);
  const quizzes = getQuizzesByTeacher(currentTeacher.id);
  const results = getResultsByTeacher(currentTeacher.id);

  // Student averages for bar chart
  const studentData = students
    .map((s) => {
      const { average, count } = getStudentAveragePercent(s.id);
      return {
        name: s.fullName.split(' ')[0],
        fullName: s.fullName,
        average,
        count,
      };
    })
    .filter((d) => d.count > 0)
    .sort((a, b) => b.average - a.average);

  // Distribution for pie chart
  const excellent = studentData.filter((s) => s.average >= 85).length;
  const good = studentData.filter(
    (s) => s.average >= 70 && s.average < 85
  ).length;
  const average = studentData.filter(
    (s) => s.average >= 50 && s.average < 70
  ).length;
  const poor = studentData.filter((s) => s.average < 50).length;

  const pieData = [
    { name: "A'lo (85%+)", value: excellent },
    { name: "Yaxshi (70-84%)", value: good },
    { name: "Qoniqarli (50-69%)", value: average },
    { name: "Qoniqarsiz (<50%)", value: poor },
  ].filter((d) => d.value > 0);

  // Overall stats
  let overallAvg = 0;
  if (studentData.length > 0) {
    overallAvg =
      Math.round(
        (studentData.reduce((sum, s) => sum + s.average, 0) /
          studentData.length) *
          10
      ) / 10;
  }

  // Top/Bottom students
  const topStudents = studentData.slice(0, 5);
  const bottomStudents = [...studentData].sort((a, b) => a.average - b.average).slice(0, 5);

  // Quiz comparison
  const quizData = quizzes.map((q) => {
    const stats = getQuizStats(q.id);
    return {
      name: q.quizName.length > 15 ? q.quizName.slice(0, 15) + '…' : q.quizName,
      fullName: q.quizName,
      avgPercent: stats.avgPercent,
      count: stats.count,
    };
  });

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button
            onClick={() => navigate('dashboard')}
            className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all text-slate-300"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">📊 Statistika</h1>
            <p className="text-slate-400 text-sm">
              Umumiy ko'rsatkichlar
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center animate-slide-up">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="text-white font-semibold mb-2">
              Ma'lumotlar mavjud emas
            </h3>
            <p className="text-slate-400 text-sm">
              Statistikani ko'rish uchun avval natijalarni kiriting
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3 animate-slide-up">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary-400">
                  {overallAvg}%
                </div>
                <div className="text-slate-400 text-xs mt-1">Umumiy o'rtacha</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-accent-400">
                  {results.length}
                </div>
                <div className="text-slate-400 text-xs mt-1">Jami natijalar</div>
              </div>
            </div>

            {/* Student Bar Chart */}
            {studentData.length > 0 && (
              <div className="glass-card rounded-2xl p-4 animate-slide-up">
                <h3 className="text-white font-semibold text-sm mb-3">
                  📈 O'quvchilar o'rtacha foizi
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={studentData}
                      margin={{ top: 5, right: 5, bottom: 60, left: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(value: unknown) => [`${value}%`, "O'rtacha"]}
                        labelFormatter={(label) => {
                          const student = studentData.find((s) => s.name === label);
                          return student?.fullName || String(label);
                        }}
                      />
                      <Bar
                        dataKey="average"
                        radius={[4, 4, 0, 0]}
                        fill="#3b82f6"
                      >
                        {studentData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              entry.average >= 85
                                ? '#22c55e'
                                : entry.average >= 70
                                  ? '#3b82f6'
                                  : entry.average >= 50
                                    ? '#f59e0b'
                                    : '#ef4444'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="glass-card rounded-2xl p-4 animate-slide-up">
                <h3 className="text-white font-semibold text-sm mb-3">
                  🎯 O'zlashtirish taqsimoti
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(value: unknown) => [
                          `${value} ta o'quvchi`,
                          '',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-slate-300">
                        {d.name}: {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz comparison */}
            {quizData.length > 0 && (
              <div className="glass-card rounded-2xl p-4 animate-slide-up">
                <h3 className="text-white font-semibold text-sm mb-3">
                  📝 Nazorat ishlari taqqoslash
                </h3>
                <div className="space-y-2">
                  {quizData.map((q) => (
                    <div key={q.fullName} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs truncate">
                          {q.fullName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${q.avgPercent}%`,
                                backgroundColor:
                                  q.avgPercent >= 70
                                    ? '#22c55e'
                                    : q.avgPercent >= 50
                                      ? '#f59e0b'
                                      : '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-slate-300 text-xs font-medium w-12 text-right">
                            {q.avgPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Students */}
            {topStudents.length > 0 && (
              <div className="glass-card rounded-2xl p-4 animate-slide-up">
                <h3 className="text-white font-semibold text-sm mb-3">
                  🏆 Eng yaxshi ko'rsatkichlar
                </h3>
                <div className="space-y-2">
                  {topStudents.map((s, i) => (
                    <div
                      key={s.fullName}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="text-slate-500 w-5 text-right font-mono">
                        {i + 1}.
                      </span>
                      <span className="text-lg">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}
                      </span>
                      <span className="text-white flex-1 truncate">
                        {s.fullName}
                      </span>
                      <span
                        className={`font-bold ${
                          s.average >= 85
                            ? 'text-success-400'
                            : s.average >= 70
                              ? 'text-primary-400'
                              : 'text-warn-400'
                        }`}
                      >
                        {s.average}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom students */}
            {bottomStudents.length > 0 && bottomStudents[0].average < 70 && (
              <div className="glass-card rounded-2xl p-4 animate-slide-up">
                <h3 className="text-white font-semibold text-sm mb-3">
                  ⚠️ E'tibor talab qiluvchilar
                </h3>
                <div className="space-y-2">
                  {bottomStudents
                    .filter((s) => s.average < 70)
                    .map((s, i) => (
                      <div
                        key={s.fullName}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="text-slate-500 w-5 text-right font-mono">
                          {i + 1}.
                        </span>
                        <span className="text-white flex-1 truncate">
                          {s.fullName}
                        </span>
                        <span
                          className={`font-bold ${
                            s.average >= 50 ? 'text-warn-400' : 'text-danger-400'
                          }`}
                        >
                          {s.average}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Detailed Table: All quizzes x all students */}
            {quizzes.length > 0 && students.length > 0 && (
              <div className="glass-card rounded-2xl p-4 animate-slide-up">
                <h3 className="text-white font-semibold text-sm mb-3">
                  📋 Batafsil natijalar jadvali
                </h3>
                <div className="overflow-x-auto -mx-2">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 font-medium py-2 px-2 sticky left-0 bg-slate-800/90">
                          O'quvchi
                        </th>
                        {quizzes.map((q) => (
                          <th
                            key={q.id}
                            className="text-center text-slate-400 font-medium py-2 px-2 whitespace-nowrap"
                          >
                            {q.quizName.length > 10
                              ? q.quizName.slice(0, 10) + '…'
                              : q.quizName}
                          </th>
                        ))}
                        <th className="text-center text-slate-400 font-medium py-2 px-2">
                          O'rtacha
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => {
                        const { average } = getStudentAveragePercent(s.id);
                        return (
                          <tr
                            key={s.id}
                            className="border-b border-slate-700/50 hover:bg-slate-700/20"
                          >
                            <td className="py-2 px-2 text-white sticky left-0 bg-slate-800/90 whitespace-nowrap">
                              {s.fullName.length > 12
                                ? s.fullName.slice(0, 12) + '…'
                                : s.fullName}
                            </td>
                            {quizzes.map((q) => {
                              const res = getResultsByQuiz(q.id).find(
                                (r) => r.studentId === s.id
                              );
                              return (
                                <td
                                  key={q.id}
                                  className="py-2 px-2 text-center"
                                >
                                  {res ? (
                                    <span
                                      className={`font-medium ${
                                        res.percent >= 85
                                          ? 'text-success-400'
                                          : res.percent >= 70
                                            ? 'text-primary-400'
                                            : res.percent >= 50
                                              ? 'text-warn-400'
                                              : 'text-danger-400'
                                      }`}
                                    >
                                      {res.score}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-2 px-2 text-center">
                              {average > 0 ? (
                                <span
                                  className={`font-bold ${
                                    average >= 85
                                      ? 'text-success-400'
                                      : average >= 70
                                        ? 'text-primary-400'
                                        : average >= 50
                                          ? 'text-warn-400'
                                          : 'text-danger-400'
                                  }`}
                                >
                                  {average}%
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
