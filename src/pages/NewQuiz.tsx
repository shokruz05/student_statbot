import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ViewType } from '../types';
import Header from '../components/Header';
import SuccessToast from '../components/SuccessToast';

interface NewQuizProps {
  onNavigate: (view: ViewType) => void;
}

const NewQuiz: React.FC<NewQuizProps> = ({ onNavigate }) => {
  const { addQuiz, quizzes, getAllQuizzesWithStats } = useData();
  const [quizName, setQuizName] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);

  const quizzesWithStats = getAllQuizzesWithStats();

  const handleSubmit = () => {
    if (!quizName.trim()) {
      setError('Nazorat ishi nomini kiriting');
      return;
    }
    
    const maxScoreNum = parseInt(maxScore);
    if (isNaN(maxScoreNum) || maxScoreNum <= 0) {
      setError('Maksimum ballni to\'g\'ri kiriting');
      return;
    }

    addQuiz(quizName, maxScoreNum);
    setToast({ 
      message: 'Nazorat ishi yaratildi!', 
      subMessage: `${quizName} (${maxScoreNum} ball)` 
    });
    setQuizName('');
    setMaxScore('');
    setError('');
  };

  // Quick templates
  const templates = [
    { name: 'Kundalik nazorat', score: 10 },
    { name: 'Mustaqil ish', score: 20 },
    { name: 'Nazorat ishi', score: 30 },
    { name: 'Yarim yillik', score: 50 },
    { name: 'Yillik nazorat', score: 100 },
  ];

  const applyTemplate = (template: { name: string; score: number }) => {
    setQuizName(template.name);
    setMaxScore(template.score.toString());
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Yangi Nazorat Ishi" showBack onBack={() => onNavigate('dashboard')} />

      {toast && (
        <SuccessToast
          message={toast.message}
          subMessage={toast.subMessage}
          onClose={() => setToast(null)}
        />
      )}

      <div className="px-4 py-6">
        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Yangi nazorat ishi yaratish</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazorat ishi nomi
              </label>
              <input
                type="text"
                value={quizName}
                onChange={(e) => {
                  setQuizName(e.target.value);
                  setError('');
                }}
                placeholder="Masalan: 1-chorak nazorat ishi"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum ball
              </label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => {
                  setMaxScore(e.target.value);
                  setError('');
                }}
                placeholder="Masalan: 100"
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!quizName.trim() || !maxScore}
              className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
            >
              ✅ Yaratish
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">⚡ Tezkor shablonlar</h3>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
              >
                <p className="font-medium text-gray-800 text-sm">{template.name}</p>
                <p className="text-xs text-gray-500">{template.score} ball</p>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Quizzes */}
        {quizzes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">📋 Mavjud nazorat ishlari</h3>
              <button
                onClick={() => onNavigate('delete-quiz')}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                O'chirish
              </button>
            </div>
            <div className="space-y-3">
              {quizzesWithStats.map(quiz => (
                <div
                  key={quiz.quiz_id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{quiz.quiz_name}</h4>
                      <p className="text-sm text-gray-500">
                        Maksimum: {quiz.max_score} ball
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        quiz.totalStudents > 0 ? 'text-indigo-600' : 'text-gray-400'
                      }`}>
                        {quiz.totalStudents > 0 ? `${quiz.averagePercent}%` : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {quiz.totalStudents} ta natija
                      </p>
                    </div>
                  </div>
                  {quiz.totalStudents > 0 && (
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${quiz.averagePercent}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewQuiz;
