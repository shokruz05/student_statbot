import { useState } from 'react';
import { useApp } from '../context';
import {
  getStudentsByTeacher,
  createStudent,
  deleteStudent,
  updateStudent,
  getStudentAveragePercent,
} from '../db';

export default function StudentsPage() {
  const { currentTeacher, navigate, refresh, refreshKey } = useApp();
  if (!currentTeacher) return null;

  void refreshKey;

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const students = getStudentsByTeacher(currentTeacher.id);
  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    createStudent(currentTeacher.id, newName.trim());
    setNewName('');
    setShowAdd(false);
    refresh();
  };

  const handleAddMultiple = () => {
    const names = newName.split('\n').filter((n) => n.trim());
    names.forEach((name) => {
      createStudent(currentTeacher.id, name.trim());
    });
    setNewName('');
    setShowAdd(false);
    refresh();
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateStudent(id, { fullName: editName.trim() });
    setEditingId(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setDeleteConfirm(null);
    refresh();
  };

  const getGradeColor = (avg: number) => {
    if (avg >= 85) return 'text-success-400';
    if (avg >= 70) return 'text-success-500';
    if (avg >= 50) return 'text-warn-400';
    return 'text-danger-400';
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
            <h1 className="text-xl font-bold text-white">👥 O'quvchilar</h1>
            <p className="text-slate-400 text-sm">
              {students.length} ta o'quvchi
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg"
          >
            ➕ Qo'shish
          </button>
        </div>

        {/* Search */}
        {students.length > 0 && (
          <div className="mb-4 animate-fade-in">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Qidirish..."
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
            />
          </div>
        )}

        {/* Add Form Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  ➕ O'quvchi qo'shish
                </h2>
                <button
                  onClick={() => { setShowAdd(false); setNewName(''); }}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                Bir nechta o'quvchini qo'shish uchun har birini yangi qatordan yozing
              </p>
              <textarea
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={"Misol:\nAliyev Sardor\nKarimova Nilufar\nRahimov Jasur"}
                rows={5}
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all text-sm resize-none"
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setShowAdd(false); setNewName(''); }}
                  className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl font-medium transition-all text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={newName.includes('\n') ? handleAddMultiple : handleAdd}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
                >
                  ✅ Saqlash
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
                    {students.find((s) => s.id === deleteConfirm)?.fullName}
                  </span>
                </p>
                <p className="text-slate-500 text-xs mb-5">
                  O'quvchi va uning barcha natijalari o'chiriladi
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

        {/* Student List */}
        {students.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center animate-slide-up">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="text-white font-semibold mb-2">
              O'quvchilar hali qo'shilmagan
            </h3>
            <p className="text-slate-400 text-sm">
              "➕ Qo'shish" tugmasini bosing
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map((student, i) => {
              const { average, count } = getStudentAveragePercent(student.id);
              const isEditing = editingId === student.id;

              return (
                <div
                  key={student.id}
                  className="glass-card rounded-xl p-3 animate-slide-up group"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(student.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => handleUpdate(student.id)}
                        className="px-3 py-2 bg-success-600 text-white rounded-lg text-sm"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {student.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() =>
                          navigate('student-detail', {
                            studentId: student.id,
                          })
                        }
                      >
                        <div className="text-white font-medium text-sm truncate">
                          {student.fullName}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {count > 0 ? (
                            <>
                              {count} ta ish ·{' '}
                              <span className={getGradeColor(average)}>
                                {average}%
                              </span>
                            </>
                          ) : (
                            "Natijalar yo'q"
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(student.id);
                            setEditName(student.fullName);
                          }}
                          className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-all text-xs"
                          title="Tahrirlash"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(student.id)}
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
