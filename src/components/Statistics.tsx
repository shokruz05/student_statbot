import { useState, useEffect, useCallback } from 'react';
import {
  getAllStudents,
  getAllQuizzes,
  getStudentStats,
  getResultsForQuiz,
  type Student,
  type Quiz,
  type Result,
} from '../db';
import {
  ArrowLeft,
  User,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

type ViewMode = 'overview' | 'student-detail' | 'quiz-detail';

function getColorForPercent(p: number): string {
  if (p >= 85) return 'text-emerald-600';
  if (p >= 70) return 'text-green-600';
  if (p >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function getBgForPercent(p: number): string {
  if (p >= 85) return 'bg-emerald-100 text-emerald-700';
  if (p >= 70) return 'bg-green-100 text-green-700';
  if (p >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function getBarColor(p: number): string {
  if (p >= 85) return 'from-emerald-400 to-emerald-500';
  if (p >= 70) return 'from-green-400 to-green-500';
  if (p >= 50) return 'from-amber-400 to-amber-500';
  return 'from-red-400 to-red-500';
}

export default function Statistics({ onBack }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [studentStatsMap, setStudentStatsMap] = useState<
    Map<number, { totalWorks: number; averagePercent: number }>
  >(new Map());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [studentDetail, setStudentDetail] = useState<{
    totalWorks: number;
    averagePercent: number;
    results: (Result & { quiz_name: string; max_score: number })[];
  } | null>(null);
  const [quizDetail, setQuizDetail] = useState<
    { student: Student; result: Result }[]
  >([]);
  const [sortBy, setSortBy] = useState<'name' | 'percent'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, q] = await Promise.all([getAllStudents(), getAllQuizzes()]);
      setStudents(s);
      setQuizzes(q);

      const statsMap = new Map<number, { totalWorks: number; averagePercent: number }>();
      for (const student of s) {
        const stats = await getStudentStats(student.student_id!);
        statsMap.set(student.student_id!, {
          totalWorks: stats.totalWorks,
          averagePercent: stats.averagePercent,
        });
      }
      setStudentStatsMap(statsMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    const detail = await getStudentStats(student.student_id!);
    setStudentDetail(detail);
    setViewMode('student-detail');
  };

  const handleViewQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    const results = await getResultsForQuiz(quiz.quiz_id!);
    const studentMap = new Map(students.map((s) => [s.student_id!, s]));
    const detail = results
      .map((r) => ({
        student: studentMap.get(r.student_id)!,
        result: r,
      }))
      .filter((d) => d.student)
      .sort((a, b) => b.result.percent - a.result.percent);
    setQuizDetail(detail);
    setViewMode('quiz-detail');
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      const cmp = a.full_name.localeCompare(b.full_name, 'ru');
      return sortAsc ? cmp : -cmp;
    }
    const pA = studentStatsMap.get(a.student_id!)?.averagePercent ?? 0;
    const pB = studentStatsMap.get(b.student_id!)?.averagePercent ?? 0;
    return sortAsc ? pA - pB : pB - pA;
  });

  const handleSort = (by: 'name' | 'percent') => {
    if (sortBy === by) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(by);
      setSortAsc(by === 'name');
    }
  };

  const SortIcon = ({ field }: { field: 'name' | 'percent' }) => {
    if (sortBy !== field) return <Minus className="h-3 w-3 text-slate-300" />;
    return sortAsc ? (
      <ChevronUp className="h-3 w-3 text-indigo-500" />
    ) : (
      <ChevronDown className="h-3 w-3 text-indigo-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (viewMode === 'overview') onBack();
            else setViewMode('overview');
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">📊 Статистика</h2>
          <p className="text-xs text-slate-500">
            {viewMode === 'overview' && 'Общий обзор успеваемости'}
            {viewMode === 'student-detail' && `${selectedStudent?.full_name}`}
            {viewMode === 'quiz-detail' && `${selectedQuiz?.quiz_name}`}
          </p>
        </div>
      </div>

      {/* ── Overview ──────────────────────────────────── */}
      {viewMode === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">{students.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Учеников</div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{quizzes.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Работ</div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
              <div className={`text-2xl font-bold ${getColorForPercent(
                students.length > 0
                  ? Math.round(
                      ([...studentStatsMap.values()]
                        .filter(s => s.totalWorks > 0)
                        .reduce((sum, s) => sum + s.averagePercent, 0) /
                        Math.max([...studentStatsMap.values()].filter(s => s.totalWorks > 0).length, 1)) * 10
                    ) / 10
                  : 0
              )}`}>
                {students.length > 0
                  ? (() => {
                      const withWorks = [...studentStatsMap.values()].filter(s => s.totalWorks > 0);
                      return withWorks.length > 0
                        ? Math.round(
                            (withWorks.reduce((sum, s) => sum + s.averagePercent, 0) / withWorks.length) * 10
                          ) / 10
                        : '—';
                    })()
                  : '—'}
                {students.length > 0 && [...studentStatsMap.values()].some(s => s.totalWorks > 0) && '%'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Средний %</div>
            </div>
          </div>

          {/* Quizzes */}
          {quizzes.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Контрольные работы</h3>
              <div className="flex flex-col gap-1.5">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.quiz_id}
                    onClick={() => handleViewQuiz(quiz)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{quiz.quiz_name}</div>
                      <div className="text-xs text-slate-500">Макс. балл: {quiz.max_score}</div>
                    </div>
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Students Table */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Успеваемость учеников</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSort('name')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition ${
                    sortBy === 'name' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Имя <SortIcon field="name" />
                </button>
                <button
                  onClick={() => handleSort('percent')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition ${
                    sortBy === 'percent' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Процент <SortIcon field="percent" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {sortedStudents.map((student) => {
                const stats = studentStatsMap.get(student.student_id!);
                const hasData = stats && stats.totalWorks > 0;
                return (
                  <button
                    key={student.student_id}
                    onClick={() => handleViewStudent(student)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {student.full_name}
                      </div>
                      {hasData && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${getBarColor(stats!.averagePercent)}`}
                              style={{ width: `${Math.min(stats!.averagePercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">{stats!.totalWorks} раб.</span>
                        </div>
                      )}
                    </div>
                    {hasData ? (
                      <span className={`text-sm font-bold ${getColorForPercent(stats!.averagePercent)}`}>
                        {stats!.averagePercent}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Student Detail ────────────────────────────── */}
      {viewMode === 'student-detail' && selectedStudent && studentDetail && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{selectedStudent.full_name}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xl font-bold text-indigo-600">{studentDetail.totalWorks}</div>
                <div className="text-[10px] text-slate-500">Сдано работ</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className={`text-xl font-bold ${studentDetail.totalWorks > 0 ? getColorForPercent(studentDetail.averagePercent) : 'text-slate-400'}`}>
                  {studentDetail.totalWorks > 0 ? `${studentDetail.averagePercent}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-500">Средний процент</div>
              </div>
            </div>
          </div>

          {studentDetail.results.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-slate-700">История работ</h4>
              {studentDetail.results.map((r) => (
                <div
                  key={r.result_id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${getBgForPercent(r.percent)}`}>
                    {r.percent >= 70 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : r.percent >= 50 ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{r.quiz_name}</div>
                    <div className="text-xs text-slate-500">
                      {r.score}/{r.max_score} баллов • {new Date(r.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${getColorForPercent(r.percent)}`}>
                    {r.percent}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              Нет результатов
            </div>
          )}
        </div>
      )}

      {/* ── Quiz Detail ───────────────────────────────── */}
      {viewMode === 'quiz-detail' && selectedQuiz && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{selectedQuiz.quiz_name}</h3>
            <p className="text-sm text-slate-500 mt-1">Макс. балл: {selectedQuiz.max_score}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-lg font-bold text-indigo-600">{quizDetail.length}</div>
                <div className="text-[10px] text-slate-500">Сдали</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-lg font-bold text-slate-600">
                  {students.length - quizDetail.length}
                </div>
                <div className="text-[10px] text-slate-500">Не сдали</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <div className={`text-lg font-bold ${
                  quizDetail.length > 0
                    ? getColorForPercent(
                        Math.round(
                          (quizDetail.reduce((s, d) => s + d.result.percent, 0) / quizDetail.length) * 10
                        ) / 10
                      )
                    : 'text-slate-400'
                }`}>
                  {quizDetail.length > 0
                    ? `${Math.round(
                        (quizDetail.reduce((s, d) => s + d.result.percent, 0) / quizDetail.length) * 10
                      ) / 10}%`
                    : '—'}
                </div>
                <div className="text-[10px] text-slate-500">Средний</div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          {quizDetail.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-slate-700">Результаты (по убыванию)</h4>
              {quizDetail.map((d, i) => (
                <div
                  key={d.result.result_id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm"
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-200 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {i < 3 ? (
                      <Award className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {d.student.full_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {d.result.score}/{selectedQuiz.max_score}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getBarColor(d.result.percent)}`}
                        style={{ width: `${Math.min(d.result.percent, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${getColorForPercent(d.result.percent)} w-12 text-right`}>
                      {d.result.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
