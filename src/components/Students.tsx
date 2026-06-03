import { useState, useEffect, useCallback } from 'react';
import {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  getStudentStats,
  type Student,
} from '../db';
import {
  ArrowLeft,
  Plus,
  User,
  Trash2,
  Pencil,
  Search,
  Loader2,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  onBack: () => void;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export default function Students({ onBack, onToast }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [studentWorkCounts, setStudentWorkCounts] = useState<Map<number, number>>(new Map());

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getAllStudents();
      setStudents(s);
      
      const counts = new Map<number, number>();
      for (const student of s) {
        const stats = await getStudentStats(student.student_id!);
        counts.set(student.student_id!, stats.totalWorks);
      }
      setStudentWorkCounts(counts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = async () => {
    const name = newStudentName.trim();
    if (!name) return;

    setAdding(true);
    try {
      await addStudent(name);
      setNewStudentName('');
      setShowAddForm(false);
      await loadStudents();
      onToast('success', `Ученик "${name}" добавлен`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (student: Student) => {
    try {
      await deleteStudent(student.student_id!);
      setConfirmDeleteId(null);
      await loadStudents();
      onToast('success', `Ученик "${student.full_name}" удалён`);
    } catch {
      onToast('error', 'Ошибка при удалении');
    }
  };

  const handleStartEdit = (student: Student) => {
    setEditingId(student.student_id!);
    setEditName(student.full_name);
  };

  const handleSaveEdit = async (studentId: number) => {
    const name = editName.trim();
    if (!name) return;
    try {
      await updateStudent(studentId, name);
      setEditingId(null);
      await loadStudents();
      onToast('success', 'Имя обновлено');
    } catch {
      onToast('error', 'Ошибка при обновлении');
    }
  };

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900">👥 Ученики</h2>
          <p className="text-xs text-slate-500">
            Всего: {students.length} учеников
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            showAddForm
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
          }`}
        >
          {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="mb-2 text-sm font-semibold text-indigo-800">Добавить ученика</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddStudent();
              }}
              placeholder="ФИО ученика"
              autoFocus
              className="flex-1 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={handleAddStudent}
              disabled={adding || !newStudentName.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-600 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Student List */}
      <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {filteredStudents.length === 0 && (
          <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
            {searchQuery ? 'Никого не найдено' : 'Нет учеников. Добавьте первого!'}
          </div>
        )}

        {filteredStudents.map((student) => {
          const workCount = studentWorkCounts.get(student.student_id!) ?? 0;
          
          return (
            <div
              key={student.student_id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
                <User className="h-5 w-5" />
              </div>

              {editingId === student.student_id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(student.student_id!);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="flex-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    onClick={() => handleSaveEdit(student.student_id!)}
                    className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600 hover:bg-emerald-200"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {student.full_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {workCount > 0 ? `${workCount} работ` : 'Нет работ'}
                    </div>
                  </div>

                  {confirmDeleteId === student.student_id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-red-500 flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        Удалить?
                      </span>
                      <button
                        onClick={() => handleDelete(student)}
                        className="rounded-lg bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(student)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(student.student_id!)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
