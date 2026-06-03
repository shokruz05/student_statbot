import { useApp } from '../context';
import {
  getQuiz,
  getResultsByQuiz,
  getStudent,
  getQuizStats,
  deleteResult,
} from '../db';
import { useState } from 'react';

export default function QuizDetailPage() {
  const { selectedQuizId, navigate, refresh, refreshKey } = useApp();
  if (!selectedQuizId) return null;

  void refreshKey;

  const quiz = getQuiz(selectedQuizId);
  if (!quiz) return null;

  const results = getResultsByQuiz(selectedQuizId);
  const stats = getQuizStats(selectedQuizId);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteResult = (id: string) => {
    deleteResult(id);
    setDeleteConfirm(null);
    refresh();
  };

  const getGradeColor = (percent: number) => {
    if (percent >= 85) return 'text-success-400';
    if (percent >= 70) return 'text-primary-400';
    if (percent >= 50) return 'text-warn-400';
    return 'text-danger-400';
  };

  const getGradeEmoji = (percent: number) => {
    if (percent >= 85) return '🟢';
    if (percent >= 70) return '🔵';
    if (percent >= 50) return '🟡';
    return '🔴';
  };

  const sortedResults = [...results].sort((a, b) => b.percent - a.percent);

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button
            onClick={() => navigate('quizzes')}
            className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all text-slate-300"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{quiz.quizName}</h1>
            <p className="text-slate-400 text-sm">
              Maks: {quiz.maxScore} ball
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 animate-slide-up">
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary-400">
              {stats.count > 0 ? `${stats.avgPercent}%` : '—'}
            </div>
            <div className="text-slate-400 text-xs mt-1">O'rtacha foiz</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent-400">
              {stats.count}
            </div>
            <div className="text-slate-400 text-xs mt-1">Natijalar soni</div>
          </div>
        </div>

        {stats.count > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4 animate-slide-up">
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-success-400">
                {stats.maxScoreAchieved}
              </div>
              <div className="text-slate-400 text-xs mt-1">Eng yuqori ball</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-danger-400">
                {stats.minScoreAchieved}
              </div>
              <div className="text-slate-400 text-xs mt-1">Eng past ball</div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 w-full max-w-sm animate-slide-up">
              <div className="text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Natijani o'chirish
                </h3>
                <p className="text-slate-400 text-sm mb-5">
                  Bu natija butunlay o'chiriladi
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-slate-700/50 text-slate-300 rounded-xl font-medium text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => handleDeleteResult(deleteConfirm)}
                  className="flex-1 py-3 bg-gradient-to-r from-danger-500 to-danger-600 text-white rounded-xl font-semibold text-sm"
                >
                  🗑 O'chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results list */}
        {results.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center animate-slide-up">
            <p className="text-slate-400 text-sm">
              Hali natijalar kiritilmagan
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            <h3 className="text-white font-semibold text-sm mb-2">
              📋 O'quvchilar natijalari (reyting bo'yicha)
            </h3>
            {sortedResults.map((result, i) => {
              const student = getStudent(result.studentId);
              if (!student) return null;
              return (
                <div
                  key={result.id}
                  className="glass-card rounded-xl p-3 flex items-center gap-3 group"
                >
                  <div className="w-7 text-center text-slate-500 text-sm font-mono">
                    {i + 1}.
                  </div>
                  <div className="text-lg">{getGradeEmoji(result.percent)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {student.fullName}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {result.score} / {quiz.maxScore} ball ·{' '}
                      <span className={getGradeColor(result.percent)}>
                        {result.percent}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(result.id)}
                    className="p-1.5 hover:bg-danger-500/20 rounded-lg text-slate-500 hover:text-danger-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    🗑
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
