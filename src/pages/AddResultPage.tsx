import { useState } from 'react';
import { useApp } from '../context';
import {
  getQuizzesByTeacher,
  getStudentsByTeacher,
  getResultForStudentQuiz,
  getStudentAveragePercent,
  getQuiz,
  getStudent,
  addResult,
  createQuiz,
} from '../db';

type Step = 'choose-quiz' | 'choose-student' | 'input-score';

export default function AddResultPage() {
  const { currentTeacher, navigate, refresh, refreshKey } = useApp();
  if (!currentTeacher) return null;

  void refreshKey;

  const [step, setStep] = useState<Step>('choose-quiz');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New quiz form
  const [showNewQuiz, setShowNewQuiz] = useState(false);
  const [newQuizName, setNewQuizName] = useState('');
  const [newQuizMaxScore, setNewQuizMaxScore] = useState('');

  const quizzes = getQuizzesByTeacher(currentTeacher.id);
  const students = getStudentsByTeacher(currentTeacher.id);

  const selectedQuiz = selectedQuizId ? getQuiz(selectedQuizId) : null;
  const selectedStudent = selectedStudentId ? getStudent(selectedStudentId) : null;

  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setStep('choose-student');
    setError('');
    setSuccessMessage(null);
    setSearchQuery('');
  };

  const handleCreateQuiz = () => {
    if (!newQuizName.trim()) {
      setError("Nomini kiriting");
      return;
    }
    const maxScore = parseInt(newQuizMaxScore);
    if (isNaN(maxScore) || maxScore <= 0) {
      setError("Maksimal ballni to'g'ri kiriting");
      return;
    }
    const quiz = createQuiz(currentTeacher.id, newQuizName.trim(), maxScore);
    setShowNewQuiz(false);
    setNewQuizName('');
    setNewQuizMaxScore('');
    setError('');
    handleSelectQuiz(quiz.id);
    refresh();
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setScoreInput('');
    setError('');
    setSuccessMessage(null);
    setStep('input-score');
  };

  const handleSubmitScore = () => {
    if (!selectedQuiz || !selectedStudent) return;

    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0) {
      setError("Ball 0 dan kam bo'lmasligi kerak");
      return;
    }
    if (score > selectedQuiz.maxScore) {
      setError(`Ball ${selectedQuiz.maxScore} dan oshmasligi kerak`);
      return;
    }

    addResult(currentTeacher.id, selectedStudent.id, selectedQuiz.id, score);

    const percent = Math.round((score / selectedQuiz.maxScore) * 1000) / 10;
    const { average, count } = getStudentAveragePercent(selectedStudent.id);

    const msg = `📊 Natija muvaffaqiyatli kiritildi!

👤 O'quvchi: ${selectedStudent.fullName}
📝 Ish: ${selectedQuiz.quizName}
🎯 Ball: ${score} / ${selectedQuiz.maxScore}
📈 Foiz: ${percent}%

━━━━━━━━━━━━━━━━━━
📋 Umumiy ko'rsatkich:
• Jami ishlar soni: ${count}
• O'rtacha foiz: ${average}%
━━━━━━━━━━━━━━━━━━`;

    setSuccessMessage(msg);
    setScoreInput('');
    setError('');
    refresh();

    // Auto-return to student list after delay
    setTimeout(() => {
      setSuccessMessage(null);
      setStep('choose-student');
      setSelectedStudentId(null);
      setSearchQuery('');
    }, 3000);
  };

  const handleBack = () => {
    if (step === 'input-score') {
      setStep('choose-student');
      setSelectedStudentId(null);
      setSuccessMessage(null);
      setSearchQuery('');
    } else if (step === 'choose-student') {
      setStep('choose-quiz');
      setSelectedQuizId(null);
      setSuccessMessage(null);
    } else {
      navigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button
            onClick={handleBack}
            className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all text-slate-300"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              ➕ Natija qo'shish
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 'choose-quiz' && 'Nazorat ishini tanlang'}
              {step === 'choose-student' && selectedQuiz?.quizName}
              {step === 'input-score' && selectedStudent?.fullName}
            </p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          {['Nazorat ishi', "O'quvchi", 'Ball'].map((label, i) => {
            const stepIndex =
              step === 'choose-quiz' ? 0 : step === 'choose-student' ? 1 : 2;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isDone
                      ? 'bg-success-500 text-white'
                      : isActive
                        ? 'bg-primary-500 text-white animate-pulse-glow'
                        : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs truncate ${
                    isActive ? 'text-white font-medium' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded ${
                      isDone ? 'bg-success-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="glass-card rounded-2xl p-5 mb-4 border border-success-500/30 animate-slide-up">
            <pre className="text-slate-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {successMessage}
            </pre>
          </div>
        )}

        {/* Step 1: Choose Quiz */}
        {step === 'choose-quiz' && !successMessage && (
          <div className="space-y-2 animate-slide-up">
            <button
              onClick={() => setShowNewQuiz(true)}
              className="w-full glass-card rounded-xl p-4 flex items-center gap-3 hover:bg-slate-700/40 transition-all border border-dashed border-slate-600/50 hover:border-primary-500/50"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-xl">
                🆕
              </div>
              <div className="text-left">
                <div className="text-white font-medium text-sm">
                  Yangi nazorat ishi yaratish
                </div>
                <div className="text-slate-400 text-xs">
                  Nom va maksimal ballni kiriting
                </div>
              </div>
            </button>

            {quizzes.length === 0 && (
              <div className="text-center p-6 text-slate-400 text-sm">
                Hali nazorat ishlari yaratilmagan
              </div>
            )}

            {quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => handleSelectQuiz(quiz.id)}
                className="w-full glass-card rounded-xl p-4 flex items-center gap-3 hover:bg-slate-700/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl">
                  📝
                </div>
                <div className="text-left flex-1">
                  <div className="text-white font-medium text-sm">
                    {quiz.quizName}
                  </div>
                  <div className="text-slate-400 text-xs">
                    Maks: {quiz.maxScore} ball
                  </div>
                </div>
                <span className="text-slate-500 text-lg">→</span>
              </button>
            ))}
          </div>
        )}

        {/* New Quiz Modal */}
        {showNewQuiz && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  🆕 Yangi nazorat ishi
                </h2>
                <button
                  onClick={() => { setShowNewQuiz(false); setError(''); }}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  value={newQuizName}
                  onChange={(e) => setNewQuizName(e.target.value)}
                  placeholder="Nomi: Nazorat ishi №1"
                  className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
                  autoFocus
                />
                <input
                  type="number"
                  value={newQuizMaxScore}
                  onChange={(e) => setNewQuizMaxScore(e.target.value)}
                  placeholder="Maksimal ball: 30"
                  min="1"
                  className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
                />
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setShowNewQuiz(false); setError(''); }}
                  className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl font-medium transition-all text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleCreateQuiz}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
                >
                  ✅ Yaratish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Student */}
        {step === 'choose-student' && !successMessage && (
          <div className="animate-slide-up">
            {students.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="text-5xl mb-3">👥</div>
                <h3 className="text-white font-semibold mb-2">
                  O'quvchilar hali qo'shilmagan
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Avval o'quvchilarni qo'shing
                </p>
                <button
                  onClick={() => navigate('students')}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-medium"
                >
                  O'quvchilarni qo'shish →
                </button>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 O'quvchi qidirish..."
                    className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
                  />
                </div>

                {/* Progress info */}
                {selectedQuiz && (
                  <div className="mb-3 glass-card rounded-xl p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Natija kiritilgan:
                      </span>
                      <span className="text-white font-medium">
                        {
                          students.filter(
                            (s) =>
                              getResultForStudentQuiz(s.id, selectedQuiz.id) !==
                              undefined
                          ).length
                        }{' '}
                        / {students.length}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-success-500 rounded-full transition-all"
                        style={{
                          width: `${
                            (students.filter(
                              (s) =>
                                getResultForStudentQuiz(
                                  s.id,
                                  selectedQuiz.id
                                ) !== undefined
                            ).length /
                              students.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  {filteredStudents.map((student) => {
                    const existingResult = selectedQuizId
                      ? getResultForStudentQuiz(student.id, selectedQuizId)
                      : undefined;
                    const hasResult = !!existingResult;

                    return (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student.id)}
                        className={`w-full rounded-xl p-3 flex items-center gap-3 transition-all ${
                          hasResult
                            ? 'glass-card border border-success-500/20 hover:bg-slate-700/40'
                            : 'glass-card hover:bg-slate-700/40'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                            hasResult
                              ? 'bg-success-600'
                              : 'bg-gradient-to-br from-primary-500 to-accent-500'
                          }`}
                        >
                          {hasResult ? '✅' : student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {student.fullName}
                          </div>
                          {hasResult && existingResult && (
                            <div className="text-success-400 text-xs">
                              ✅ {existingResult.score} / {selectedQuiz?.maxScore} ({existingResult.percent}%)
                            </div>
                          )}
                        </div>
                        <span className="text-slate-500 text-sm">
                          {hasResult ? '✏️' : '→'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Input Score */}
        {step === 'input-score' && !successMessage && selectedStudent && selectedQuiz && (
          <div className="animate-slide-up">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                {selectedStudent.fullName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-white font-bold text-lg mb-1">
                {selectedStudent.fullName}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {selectedQuiz.quizName} (maks: {selectedQuiz.maxScore} ball)
              </p>

              {error && (
                <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-slate-300 text-sm mb-2 font-medium">
                  Ball kiriting (0 — {selectedQuiz.maxScore})
                </label>
                <input
                  type="number"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="Misol: 17"
                  min="0"
                  max={selectedQuiz.maxScore}
                  className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitScore();
                  }}
                />
                {scoreInput && !isNaN(parseInt(scoreInput)) && (
                  <div className="mt-3 text-slate-300 text-sm">
                    Foiz:{' '}
                    <span className="text-primary-400 font-bold text-lg">
                      {Math.round(
                        (parseInt(scoreInput) / selectedQuiz.maxScore) * 1000
                      ) / 10}
                      %
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep('choose-student');
                    setSelectedStudentId(null);
                    setError('');
                  }}
                  className="flex-1 py-3.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl font-medium transition-all"
                >
                  ← Orqaga
                </button>
                <button
                  onClick={handleSubmitScore}
                  className="flex-1 py-3.5 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white rounded-xl font-semibold transition-all shadow-lg active:scale-[0.98]"
                >
                  ✅ Saqlash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
