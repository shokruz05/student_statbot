import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ViewType, Student } from '../types';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import SuccessToast from '../components/SuccessToast';

interface StudentsProps {
  onNavigate: (view: ViewType) => void;
  onSelectStudent: (studentId: number) => void;
}

const Students: React.FC<StudentsProps> = ({ onNavigate, onSelectStudent }) => {
  const { students, addStudent, deleteStudent, getStudentStats } = useData();
  const [newStudentName, setNewStudentName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    addStudent(newStudentName);
    setNewStudentName('');
    setShowAddForm(false);
    setToast({ 
      message: "O'quvchi qo'shildi!", 
      subMessage: newStudentName 
    });
  };

  const handleDeleteStudent = () => {
    if (!deleteConfirm) return;
    deleteStudent(deleteConfirm.student_id);
    setToast({ 
      message: "O'quvchi o'chirildi", 
      subMessage: deleteConfirm.full_name 
    });
    setDeleteConfirm(null);
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort students by name
  const sortedStudents = [...filteredStudents].sort((a, b) => 
    a.full_name.localeCompare(b.full_name, 'uz')
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="O'quvchilar" showBack onBack={() => onNavigate('dashboard')} />

      {toast && (
        <SuccessToast
          message={toast.message}
          subMessage={toast.subMessage}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="O'quvchini o'chirish"
        message={`"${deleteConfirm?.full_name}" o'quvchisini va barcha natijalarini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        onConfirm={handleDeleteStudent}
        onCancel={() => setDeleteConfirm(null)}
        danger
      />

      {/* Stats & Add Button */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{students.length}</h2>
            <p className="text-sm text-gray-500">Jami o'quvchilar</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <span>➕</span>
            <span>Qo'shish</span>
          </button>
        </div>

        {/* Search */}
        {students.length > 0 && (
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O'quvchi qidirish..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
              <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Yangi o'quvchi qo'shish</h3>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="To'liq ism (masalan: Aliyev Vali)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={!newStudentName.trim()}
                  className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Qo'shish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student List */}
        {students.length === 0 ? (
          <EmptyState
            icon="👥"
            title="O'quvchilar ro'yxati bo'sh"
            description="O'quvchilarni qo'shish uchun yuqoridagi tugmani bosing"
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Hech narsa topilmadi"
            description="Qidiruv so'rovingizga mos o'quvchi topilmadi"
          />
        ) : (
          <div className="space-y-3">
            {sortedStudents.map((student, index) => {
              const stats = getStudentStats(student.student_id);
              return (
                <div
                  key={student.student_id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{student.full_name}</h4>
                      <p className="text-sm text-gray-500">
                        {stats.totalQuizzes > 0 
                          ? `${stats.totalQuizzes} ta ish • O'rtacha: ${stats.averagePercent}%`
                          : "Hali natija yo'q"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {stats.totalQuizzes > 0 && (
                        <button
                          onClick={() => onSelectStudent(student.student_id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Batafsil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(student)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  {stats.totalQuizzes > 0 && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stats.averagePercent >= 80 ? 'bg-green-500' :
                            stats.averagePercent >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${stats.averagePercent}%` }}
                        />
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
};

export default Students;
