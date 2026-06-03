import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ViewType, Quiz } from '../types';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import SuccessToast from '../components/SuccessToast';

interface DeleteQuizProps {
  onNavigate: (view: ViewType) => void;
}

const DeleteQuiz: React.FC<DeleteQuizProps> = ({ onNavigate }) => {
  const { quizzes, deleteQuiz, getAllQuizzesWithStats } = useData();
  const [deleteConfirm, setDeleteConfirm] = useState<Quiz | null>(null);
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);

  const quizzesWithStats = getAllQuizzesWithStats();

  const handleDeleteQuiz = () => {
    if (!deleteConfirm) return;
    deleteQuiz(deleteConfirm.quiz_id);
    setToast({ 
      message: "Nazorat ishi o'chirildi!", 
      subMessage: deleteConfirm.quiz_name 
    });
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Nazorat Ishini O'chirish" showBack onBack={() => onNavigate('dashboard')} />

      {toast && (
        <SuccessToast
          message={toast.message}
          subMessage={toast.subMessage}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Nazorat ishini o'chirish"
        message={`"${deleteConfirm?.quiz_name}" nazorat ishi va barcha natijalari butunlay o'chiriladi. Davom etasizmi?`}
        confirmLabel="Ha, o'chirish"
        cancelLabel="Bekor qilish"
        onConfirm={handleDeleteQuiz}
        onCancel={() => setDeleteConfirm(null)}
        danger
      />

      <div className="px-4 py-6">
        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-amber-800">Diqqat!</h4>
              <p className="text-sm text-amber-700 mt-1">
                Nazorat ishini o'chirganingizda, barcha o'quvchilarning shu ish bo'yicha 
                natijalari ham o'chib ketadi. Bu amalni qaytarib bo'lmaydi.
              </p>
            </div>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Nazorat ishi topilmadi"
            description="Hozircha o'chirish uchun nazorat ishi mavjud emas"
            actionLabel="Nazorat ishi yaratish"
            onAction={() => onNavigate('new-quiz')}
          />
        ) : (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              🗑 O'chirish uchun tanlang
            </h3>
            <div className="space-y-3">
              {quizzesWithStats.map(quiz => (
                <button
                  key={quiz.quiz_id}
                  onClick={() => setDeleteConfirm(quiz)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-red-300 hover:bg-red-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <span className="text-xl">📝</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 group-hover:text-red-700 transition-colors">
                          {quiz.quiz_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {quiz.max_score} ball • {quiz.totalStudents} ta natija
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                      <svg 
                        className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  </div>
                  
                  {quiz.totalStudents > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">O'rtacha natija:</span>
                        <span className={`font-semibold ${
                          quiz.averagePercent >= 80 ? 'text-green-600' :
                          quiz.averagePercent >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>{quiz.averagePercent}%</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteQuiz;
