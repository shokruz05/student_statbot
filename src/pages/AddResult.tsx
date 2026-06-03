import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ViewType, StudentWithStatus } from '../types';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

interface AddResultProps {
  onNavigate: (view: ViewType) => void;
}

type Step = 'select-quiz' | 'select-student' | 'enter-score' | 'success';

interface ResultSummary {
  studentName: string;
  quizName: string;
  score: number;
  maxScore: number;
  currentPercent: number;
  totalQuizzes: number;
  averagePercent: number;
}

const AddResult: React.FC<AddResultProps> = ({ onNavigate }) => {
  const { 
    quizzes, 
    getStudentsWithStatus, 
    addOrUpdateResult, 
    getStudentStats,
    students
  } = useData();

  const [step, setStep] = useState<Step>('select-quiz');
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
  const [studentsWithStatus, setStudentsWithStatus] = useState<StudentWithStatus[]>([]);

  const selectedQuiz = quizzes.find(q => q.quiz_id === selectedQuizId);
  const selectedStudent = students.find(s => s.student_id === selectedStudentId);

  // Update students list when quiz is selected
  useEffect(() => {
    if (selectedQuizId) {
      setStudentsWithStatus(getStudentsWithStatus(selectedQuizId));
    }
  }, [selectedQuizId, getStudentsWithStatus]);

  const handleQuizSelect = (quizId: number) => {
    setSelectedQuizId(quizId);
    setStep('select-student');
    setStudentsWithStatus(getStudentsWithStatus(quizId));
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setScore('');
    setError('');
    setStep('enter-score');
  };

  const handleScoreSubmit = () => {
    if (!selectedQuiz || !selectedStudent) return;

    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > selectedQuiz.max_score) {
      setError(`Ball 0 dan ${selectedQuiz.max_score} gacha bo'lishi kerak`);
      return;
    }

    // Save result
    addOrUpdateResult(selectedStudent.student_id, selectedQuiz.quiz_id, scoreNum);

    // Calculate stats for summary
    const currentPercent = Math.round((scoreNum / selectedQuiz.max_score) * 1000) / 10;
    const stats = getStudentStats(selectedStudent.student_id);

    setResultSummary({
      studentName: selectedStudent.full_name,
      quizName: selectedQuiz.quiz_name,
      score: scoreNum,
      maxScore: selectedQuiz.max_score,
      currentPercent,
      totalQuizzes: stats.totalQuizzes + (stats.results.some(r => r.quiz_id === selectedQuiz.quiz_id) ? 0 : 1),
      averagePercent: stats.averagePercent,
    });

    setStep('success');
  };

  const handleContinue = () => {
    setSelectedStudentId(null);
    setScore('');
    setError('');
    setResultSummary(null);
    setStudentsWithStatus(getStudentsWithStatus(selectedQuizId!));
    setStep('select-student');
  };

  const handleBack = () => {
    if (step === 'select-student') {
      setSelectedQuizId(null);
      setStep('select-quiz');
    } else if (step === 'enter-score') {
      setSelectedStudentId(null);
      setStep('select-student');
    } else if (step === 'success') {
      handleContinue();
    }
  };

  // Empty states
  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header title="Natija Qo'shish" showBack onBack={() => onNavigate('dashboard')} />
        <EmptyState
          icon="📝"
          title="Nazorat ishi topilmadi"
          description="Avval nazorat ishi yarating, so'ng natija kiritishingiz mumkin"
          actionLabel="Nazorat ishi yaratish"
          onAction={() => onNavigate('new-quiz')}
        />
      </div>
    );
  }

  if (students.length === 0 && step !== 'select-quiz') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header title="Natija Qo'shish" showBack onBack={() => onNavigate('dashboard')} />
        <EmptyState
          icon="👥"
          title="O'quvchi topilmadi"
          description="Avval o'quvchilarni qo'shing, so'ng natija kiritishingiz mumkin"
          actionLabel="O'quvchi qo'shish"
          onAction={() => onNavigate('students')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header 
        title="Natija Qo'shish" 
        showBack={step !== 'select-quiz'} 
        onBack={step === 'select-quiz' ? () => onNavigate('dashboard') : handleBack} 
      />

      {/* Progress Steps */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          {['Nazorat', 'O\'quvchi', 'Ball', 'Tayyor'].map((label, index) => {
            const stepIndex = ['select-quiz', 'select-student', 'enter-score', 'success'].indexOf(step);
            const isActive = index <= stepIndex;
            const isCurrent = index === stepIndex;
            
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  } ${isCurrent ? 'ring-4 ring-indigo-200' : ''}`}>
                    {index + 1}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < stepIndex ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Quiz */}
      {step === 'select-quiz' && (
        <div className="px-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Nazorat ishini tanlang</h3>
          <div className="space-y-3">
            {quizzes.map(quiz => (
              <button
                key={quiz.quiz_id}
                onClick={() => handleQuizSelect(quiz.quiz_id)}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{quiz.quiz_name}</h4>
                    <p className="text-sm text-gray-500">
                      Maksimum: {quiz.max_score} ball
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Student */}
      {step === 'select-student' && selectedQuiz && (
        <div className="px-4">
          <div className="bg-indigo-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-indigo-600">
              <span className="font-semibold">Tanlangan ish:</span> {selectedQuiz.quiz_name} ({selectedQuiz.max_score} ball)
            </p>
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mb-4">👤 O'quvchini tanlang</h3>
          
          {studentsWithStatus.length === 0 ? (
            <EmptyState
              icon="👥"
              title="O'quvchi topilmadi"
              description="Avval o'quvchilarni qo'shing"
              actionLabel="O'quvchi qo'shish"
              onAction={() => onNavigate('students')}
            />
          ) : (
            <div className="space-y-2">
              {studentsWithStatus.map(student => (
                <button
                  key={student.student_id}
                  onClick={() => handleStudentSelect(student.student_id)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        student.hasResult ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <span className="text-xl">{student.hasResult ? '✅' : '⏳'}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{student.full_name}</h4>
                        {student.hasResult ? (
                          <p className="text-sm text-green-600">
                            {student.score} ball • {student.percent}%
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-600">Ball kiritilmagan</p>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Enter Score */}
      {step === 'enter-score' && selectedQuiz && selectedStudent && (
        <div className="px-4">
          <div className="bg-indigo-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-indigo-600 mb-1">
              <span className="font-semibold">Nazorat ishi:</span> {selectedQuiz.quiz_name}
            </p>
            <p className="text-sm text-indigo-600">
              <span className="font-semibold">O'quvchi:</span> {selectedStudent.full_name}
            </p>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Ballni kiriting</h3>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ball (maksimum: {selectedQuiz.max_score})
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => {
                setScore(e.target.value);
                setError('');
              }}
              placeholder="Masalan: 85"
              min="0"
              max={selectedQuiz.max_score}
              step="0.5"
              className={`w-full px-4 py-4 text-2xl font-bold text-center border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
            
            <button
              onClick={handleScoreSubmit}
              disabled={!score}
              className="w-full mt-4 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
            >
              Saqlash
            </button>
          </div>

          {/* Quick score buttons */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Tez tanlash:</p>
            <div className="flex flex-wrap gap-2">
              {[25, 50, 75, 100].map(percent => {
                const quickScore = Math.round((selectedQuiz.max_score * percent) / 100);
                return (
                  <button
                    key={percent}
                    onClick={() => setScore(quickScore.toString())}
                    className="px-4 py-2 bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    {quickScore} ball ({percent}%)
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && resultSummary && (
        <div className="px-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Natija muvaffaqiyatli kiritildi!</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-xs text-gray-500">O'quvchi</p>
                  <p className="font-semibold text-gray-800">{resultSummary.studentName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">📝</span>
                <div>
                  <p className="text-xs text-gray-500">Ish</p>
                  <p className="font-semibold text-gray-800">{resultSummary.quizName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                <span className="text-xl">🎯</span>
                <div>
                  <p className="text-xs text-indigo-600">Ball</p>
                  <p className="font-bold text-indigo-700 text-lg">
                    {resultSummary.score} / {resultSummary.maxScore} ball
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <span className="text-xl">📈</span>
                <div>
                  <p className="text-xs text-purple-600">Ushbu ish uchun foiz</p>
                  <p className="font-bold text-purple-700 text-lg">{resultSummary.currentPercent}%</p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 my-4" />

              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3">📋 O'quvchining umumiy ko'rsatkichi:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jami topshirilgan ishlar:</span>
                    <span className="font-semibold text-gray-800">{resultSummary.totalQuizzes} ta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">O'rtacha o'zlashtirish:</span>
                    <span className={`font-bold ${
                      resultSummary.averagePercent >= 80 ? 'text-green-600' :
                      resultSummary.averagePercent >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{resultSummary.averagePercent}%</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  💻 Dasturchi: <span className="font-semibold text-indigo-600">@kvonyeon</span>
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                ➡️ Keyingi o'quvchiga o'tish
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Bosh sahifaga qaytish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddResult;
