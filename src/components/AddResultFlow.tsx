import { useState, useEffect, useCallback } from 'react';
import {
  getAllQuizzes,
  getAllStudents,
  addQuiz,
  addResult,
  getResultsForQuiz,
  type Quiz,
  type Student,
  type Result,
} from '../db';
import {
  ArrowLeft,
  Plus,
  FileText,
  User,
  CheckCircle2,
  Loader2,
  Search,
} from 'lucide-react';

type FSMState = 'ChoiceQuiz' | 'CreateQuiz' | 'ChoiceStudent' | 'InputScore' | 'ShowResult';

interface ResultSummary {
  studentName: string;
  quizName: string;
  score: number;
  maxScore: number;
  percent: number;
  totalWorks: number;
  averagePercent: number;
}

interface Props {
  onBack: () => void;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export default function AddResultFlow({ onBack, onToast }: Props) {
  const [fsmState, setFsmState] = useState<FSMState>('ChoiceQuiz');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [quizResults, setQuizResults] = useState<Map<number, Result>>(new Map());
  const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // New quiz form
  const [newQuizName, setNewQuizName] = useState('');
  const [newQuizMaxScore, setNewQuizMaxScore] = useState('');

  const loadQuizzes = useCallback(async () => {
    const q = await getAllQuizzes();
    setQuizzes(q);
  }, []);

  const loadStudents = useCallback(async () => {
    const s = await getAllStudents();
    setStudents(s);
  }, []);

  const loadQuizResults = useCallback(async (quizId: number) => {
    const results = await getResultsForQuiz(quizId);
    const map = new Map<number, Result>();
    results.forEach((r) => map.set(r.student_id, r));
    setQuizResults(map);
  }, []);

  useEffect(() => {
    loadQuizzes();
    loadStudents();
  }, [loadQuizzes, loadStudents]);

  // ─── State: ChoiceQuiz ────────────────────────────────
  const handleSelectQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    await loadQuizResults(quiz.quiz_id!);
    setFsmState('ChoiceStudent');
  };

  // ─── State: CreateQuiz ────────────────────────────────
  const handleCreateQuiz = async () => {
    const name = newQuizName.trim();
    const maxScore = parseInt(newQuizMaxScore);
    if (!name) return;
    if (isNaN(maxScore) || maxScore <= 0) return;

    setLoading(true);
    try {
      const quiz = await addQuiz(name, maxScore);
      setNewQuizName('');
      setNewQuizMaxScore('');
      await loadQuizzes();
      setSelectedQuiz(quiz);
      await loadQuizResults(quiz.quiz_id!);
      setFsmState('ChoiceStudent');
      onToast('success', `Работа "${name}" создана`);
    } finally {
      setLoading(false);
    }
  };

  // ─── State: ChoiceStudent ─────────────────────────────
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setScoreInput('');
    setScoreError('');

    // If student already has a result for this quiz, pre-fill
    const existing = quizResults.get(student.student_id!);
    if (existing) {
      setScoreInput(existing.score.toString());
    }

    setFsmState('InputScore');
  };

  // ─── State: InputScore ────────────────────────────────
  const handleSubmitScore = async () => {
    if (!selectedQuiz || !selectedStudent) return;

    const score = parseInt(scoreInput);
    if (isNaN(score)) {
      setScoreError('Введите число');
      return;
    }
    if (score < 0) {
      setScoreError('Балл не может быть отрицательным');
      return;
    }
    if (score > selectedQuiz.max_score) {
      setScoreError(`Балл не может превышать ${selectedQuiz.max_score}`);
      return;
    }

    setLoading(true);
    try {
      const { result, totalWorks, averagePercent } = await addResult(
        selectedStudent.student_id!,
        selectedQuiz.quiz_id!,
        score,
        selectedQuiz.max_score
      );

      setResultSummary({
        studentName: selectedStudent.full_name,
        quizName: selectedQuiz.quiz_name,
        score,
        maxScore: selectedQuiz.max_score,
        percent: result.percent,
        totalWorks,
        averagePercent,
      });

      await loadQuizResults(selectedQuiz.quiz_id!);
      setFsmState('ShowResult');
    } finally {
      setLoading(false);
    }
  };

  // ─── Back to student list ─────────────────────────────
  const handleBackToStudents = () => {
    setResultSummary(null);
    setSelectedStudent(null);
    setFsmState('ChoiceStudent');
  };

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const completedCount = quizResults.size;
  const totalStudents = students.length;

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (fsmState === 'ChoiceQuiz' || fsmState === 'CreateQuiz') {
              onBack();
            } else if (fsmState === 'ChoiceStudent') {
              setSelectedQuiz(null);
              setFsmState('ChoiceQuiz');
            } else if (fsmState === 'InputScore') {
              setSelectedStudent(null);
              setFsmState('ChoiceStudent');
            } else if (fsmState === 'ShowResult') {
              handleBackToStudents();
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">➕ Добавить результат</h2>
          <p className="text-xs text-slate-500">
            {fsmState === 'ChoiceQuiz' && 'Шаг 1: Выберите контрольную работу'}
            {fsmState === 'CreateQuiz' && 'Создание новой контрольной работы'}
            {fsmState === 'ChoiceStudent' && `Шаг 2: Выберите ученика — ${selectedQuiz?.quiz_name}`}
            {fsmState === 'InputScore' && `Шаг 3: Введите балл — ${selectedStudent?.full_name}`}
            {fsmState === 'ShowResult' && 'Результат сохранён'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((step) => {
          const currentStep =
            fsmState === 'ChoiceQuiz' || fsmState === 'CreateQuiz'
              ? 1
              : fsmState === 'ChoiceStudent'
                ? 2
                : 3;
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step <= currentStep
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 3 && (
                <div
                  className={`h-0.5 w-8 rounded-full ${
                    step < currentStep ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── ChoiceQuiz ─────────────────────────────────── */}
      {fsmState === 'ChoiceQuiz' && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setFsmState('CreateQuiz')}
            className="flex items-center gap-3 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100"
          >
            <Plus className="h-5 w-5" />
            🆕 Создать новую работу
          </button>

          {quizzes.length === 0 && (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              Нет контрольных работ. Создайте первую!
            </div>
          )}

          {quizzes.map((quiz) => (
            <button
              key={quiz.quiz_id}
              onClick={() => handleSelectQuiz(quiz)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{quiz.quiz_name}</div>
                <div className="text-xs text-slate-500">Макс. балл: {quiz.max_score}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── CreateQuiz ─────────────────────────────────── */}
      {fsmState === 'CreateQuiz' && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Новая контрольная работа</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Название работы
            </label>
            <input
              type="text"
              value={newQuizName}
              onChange={(e) => setNewQuizName(e.target.value)}
              placeholder='Например: "Контрольная №1 (Тригонометрия)"'
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Максимальный балл
            </label>
            <input
              type="number"
              value={newQuizMaxScore}
              onChange={(e) => setNewQuizMaxScore(e.target.value)}
              placeholder="Например: 30"
              min={1}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFsmState('ChoiceQuiz')}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Отмена
            </button>
            <button
              onClick={handleCreateQuiz}
              disabled={loading || !newQuizName.trim() || !newQuizMaxScore}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Создать
            </button>
          </div>
        </div>
      )}

      {/* ── ChoiceStudent ──────────────────────────────── */}
      {fsmState === 'ChoiceStudent' && (
        <div className="flex flex-col gap-2">
          {/* Progress bar */}
          <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>Проверено: {completedCount} из {totalStudents}</span>
              <span className="font-semibold">{totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Поиск ученика..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
            {filteredStudents.map((student) => {
              const result = quizResults.get(student.student_id!);
              const isCompleted = !!result;
              return (
                <button
                  key={student.student_id}
                  onClick={() => handleSelectStudent(student)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition active:scale-[0.99] ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {student.full_name}
                    </div>
                    {isCompleted && (
                      <div className="text-xs text-emerald-600 font-medium">
                        ✅ {result!.score}/{selectedQuiz?.max_score} — {result!.percent}%
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── InputScore ─────────────────────────────────── */}
      {fsmState === 'InputScore' && selectedStudent && selectedQuiz && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
              <User className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-slate-900">{selectedStudent.full_name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{selectedQuiz.quiz_name}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Введите балл (макс: {selectedQuiz.max_score})
            </label>
            <input
              type="number"
              value={scoreInput}
              onChange={(e) => {
                setScoreInput(e.target.value);
                setScoreError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitScore();
              }}
              placeholder={`0 — ${selectedQuiz.max_score}`}
              min={0}
              max={selectedQuiz.max_score}
              autoFocus
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-center text-2xl font-bold outline-none transition focus:bg-white focus:ring-2 ${
                scoreError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
              }`}
            />
            {scoreError && (
              <p className="mt-1 text-xs text-red-500">{scoreError}</p>
            )}
          </div>

          <button
            onClick={handleSubmitScore}
            disabled={loading || !scoreInput}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Сохранить результат
          </button>
        </div>
      )}

      {/* ── ShowResult ─────────────────────────────────── */}
      {fsmState === 'ShowResult' && resultSummary && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
            <div className="mb-3 text-center text-lg font-bold text-emerald-700">
              📊 Результат успешно внесён!
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span className="font-medium">Ученик:</span>
                <span>{resultSummary.studentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📝</span>
                <span className="font-medium">Работа:</span>
                <span>{resultSummary.quizName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span className="font-medium">Балл:</span>
                <span>
                  {resultSummary.score} из {resultSummary.maxScore} пунктов
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span className="font-medium">Процент за работу:</span>
                <span
                  className={`font-bold ${
                    resultSummary.percent >= 70
                      ? 'text-emerald-600'
                      : resultSummary.percent >= 50
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {resultSummary.percent}%
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-emerald-200" />

            <div className="text-sm text-slate-700">
              <div className="mb-2 font-semibold text-slate-800">
                📋 Общая успеваемость ученика:
              </div>
              <div className="flex flex-col gap-1 pl-1">
                <div>
                  • Всего сдано работ:{' '}
                  <span className="font-semibold">{resultSummary.totalWorks}</span>
                </div>
                <div>
                  • Средний показатель:{' '}
                  <span
                    className={`font-bold ${
                      resultSummary.averagePercent >= 70
                        ? 'text-emerald-600'
                        : resultSummary.averagePercent >= 50
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {resultSummary.averagePercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs italic text-slate-400">
            (Возврат к списку учеников для продолжения ввода...)
          </p>

          <button
            onClick={handleBackToStudents}
            className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-600"
          >
            ← Вернуться к списку учеников
          </button>
        </div>
      )}
    </div>
  );
}
