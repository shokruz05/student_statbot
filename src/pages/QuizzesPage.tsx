import { useState } from 'react';
import { useApp } from '../context';
import {
  getQuizzesByTeacher,
  createQuiz,
  deleteQuiz,
  updateQuiz,
  getQuizStats,
} from '../db';

export default function QuizzesPage() {
  const { currentTeacher, navigate, refresh, refreshKey } = useApp();
  if (!currentTeacher) return null;

  void refreshKey;

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMaxScore, setNewMaxScore] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMaxScore, setEditMaxScore] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');

  const quizzes = getQuizzesByTeacher(currentTeacher.id);

  const handleAdd = () => {
    if (!newName.trim()) {
      setError("Nazorat ishi nomini kiriting");
      return;
    }
    const maxScore = parseInt(newMaxScore);
    if (isNaN(maxScore) || maxScore <= 0) {
      setError("Maksimal ballni to'g'ri kiriting");
      return;
    }
    createQuiz(currentTeacher.id, newName.trim(), maxScore);
    setNewName('');
    setNewMaxScore('');
    setShowAdd(false);
    setError('');
    refresh();
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    const maxScore = parseInt(editMaxScore);
    if (isNaN(maxScore) || maxScore <= 0) return;
    updateQuiz(id, { quizName: editName.trim(), maxScore });
    setEditingId(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteQuiz(id);
    setDeleteConfirm(null);
    refresh();
  };

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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">📝 Nazorat ishlari</h1>
            <p className="text-slate-400 text-sm">
              {quizzes.length} ta nazorat ishi
            </p>
          </div>
          <button
            onClick={() => { setShowAdd(true); setError(''); }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg"
          >
            ➕ Yangi
          </button>
        </div>

        {/* Add Form Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  📝 Yangi nazorat ishi
                </h2>
                <button
                  onClick={() => { setShowAdd(false); setError(''); }}
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
                <div>
                  <label className="block text-slate-300 text-sm mb-1.5 font-medium">
                    Nomi
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Misol: Nazorat ishi №1 (Trigonometriya)"
                    className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-1.5 font-medium">
                    Maksimal ball
                  </label>
                  <input
                    type="number"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(e.target.value)}
                    placeholder="Misol: 30"
                    min="1"
                    className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setShowAdd(false); setError(''); }}
                  className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl font-medium transition-all text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
                >
                  ✅ Yaratish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 w-full max-w-sm animate-slide-up">
              <div className="text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  O'chirishni tasdiqlang
                </h3>
                <p className="text-slate-400 text-sm mb-1">
                  <span className="text-white font-medium">
                    {quizzes.find((q) => q.id === deleteConfirm)?.quizName}
                  </span>
                </p>
                <p className="text-slate-500 text-xs mb-5">
                  Nazorat ishi va barcha natijalar o'chiriladi
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl font-medium transition-all text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-400 hover:to-danger-500 text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
                >
                  🗑 O'chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center animate-slide-up">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="text-white font-semibold mb-2">
              Nazorat ishlari hali yaratilmagan
            </h3>
            <p className="text-slate-400 text-sm">
              "➕ Yangi" tugmasini bosing
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz, i) => {
              const stats = getQuizStats(quiz.id);
              const isEditing = editingId === quiz.id;

              return (
                <div
                  key={quiz.id}
                  className="glass-card rounded-xl p-4 animate-slide-up group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                        autoFocus
                      />
                      <input
                        type="number"
                        value={editMaxScore}
                        onChange={(e) => setEditMaxScore(e.target.value)}
                        className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                        min="1"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(quiz.id)}
                          className="px-4 py-2 bg-success-600 text-white rounded-lg text-sm"
                        >
                          ✅ Saqlash
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shrink-0">
                        📝
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() =>
                          navigate('quiz-detail', { quizId: quiz.id })
                        }
                      >
                        <div className="text-white font-medium text-sm truncate">
                          {quiz.quizName}
                        </div>
                        <div className="text-slate-400 text-xs">
                          Maks: {quiz.maxScore} ball ·{' '}
                          {stats.count > 0
                            ? `${stats.count} ta natija · O'rtacha: ${stats.avgPercent}%`
                            : "Natijalar yo'q"}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(quiz.id);
                            setEditName(quiz.quizName);
                            setEditMaxScore(String(quiz.maxScore));
                          }}
                          className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-all text-xs"
                          title="Tahrirlash"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(quiz.id)}
                          className="p-2 hover:bg-danger-500/20 rounded-lg text-slate-400 hover:text-danger-400 transition-all text-xs"
                          title="O'chirish"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
