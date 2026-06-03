import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Teacher, Student, Quiz, Result, StudentWithStatus, StudentStats, QuizWithStats } from '../types';

// Simulated teacher ID (in production, this comes from Telegram WebApp)
const DEMO_TEACHER_ID = 8404901448;
const DEMO_USERNAME = "demo_teacher";

interface DataContextType {
  teacher: Teacher | null;
  students: Student[];
  quizzes: Quiz[];
  results: Result[];
  isLoading: boolean;
  
  // CRUD Operations
  addStudent: (fullName: string) => void;
  deleteStudent: (studentId: number) => void;
  addQuiz: (quizName: string, maxScore: number) => void;
  deleteQuiz: (quizId: number) => void;
  addOrUpdateResult: (studentId: number, quizId: number, score: number) => void;
  
  // Computed Data
  getStudentsWithStatus: (quizId: number) => StudentWithStatus[];
  getStudentStats: (studentId: number) => StudentStats;
  getQuizWithStats: (quizId: number) => QuizWithStats | null;
  getAllQuizzesWithStats: () => QuizWithStats[];
  getOverallStats: () => { totalStudents: number; totalQuizzes: number; totalResults: number; averagePercent: number };
}

const DataContext = createContext<DataContextType | null>(null);

// Helper to generate IDs
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// LocalStorage keys (simulating server-side DB)
const STORAGE_KEYS = {
  teachers: 'statbot_teachers',
  students: 'statbot_students',
  quizzes: 'statbot_quizzes',
  results: 'statbot_results',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from localStorage (simulating DB fetch)
  useEffect(() => {
    const initData = () => {
      try {
        // Get or create teacher
        const storedTeachers = localStorage.getItem(STORAGE_KEYS.teachers);
        let teachers: Teacher[] = storedTeachers ? JSON.parse(storedTeachers) : [];
        
        let currentTeacher = teachers.find(t => t.teacher_id === DEMO_TEACHER_ID);
        if (!currentTeacher) {
          currentTeacher = {
            teacher_id: DEMO_TEACHER_ID,
            username: DEMO_USERNAME,
            registered_at: new Date().toISOString(),
          };
          teachers.push(currentTeacher);
          localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(teachers));
        }
        setTeacher(currentTeacher);

        // Load students for this teacher
        const storedStudents = localStorage.getItem(STORAGE_KEYS.students);
        const allStudents: Student[] = storedStudents ? JSON.parse(storedStudents) : [];
        setStudents(allStudents.filter(s => s.teacher_id === DEMO_TEACHER_ID));

        // Load quizzes for this teacher
        const storedQuizzes = localStorage.getItem(STORAGE_KEYS.quizzes);
        const allQuizzes: Quiz[] = storedQuizzes ? JSON.parse(storedQuizzes) : [];
        setQuizzes(allQuizzes.filter(q => q.teacher_id === DEMO_TEACHER_ID));

        // Load results
        const storedResults = localStorage.getItem(STORAGE_KEYS.results);
        const allResults: Result[] = storedResults ? JSON.parse(storedResults) : [];
        const teacherStudentIds = allStudents.filter(s => s.teacher_id === DEMO_TEACHER_ID).map(s => s.student_id);
        setResults(allResults.filter(r => teacherStudentIds.includes(r.student_id)));

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Save students to localStorage
  const saveStudents = useCallback((newStudents: Student[]) => {
    const storedStudents = localStorage.getItem(STORAGE_KEYS.students);
    const allStudents: Student[] = storedStudents ? JSON.parse(storedStudents) : [];
    const otherStudents = allStudents.filter(s => s.teacher_id !== DEMO_TEACHER_ID);
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify([...otherStudents, ...newStudents]));
    setStudents(newStudents);
  }, []);

  // Save quizzes to localStorage
  const saveQuizzes = useCallback((newQuizzes: Quiz[]) => {
    const storedQuizzes = localStorage.getItem(STORAGE_KEYS.quizzes);
    const allQuizzes: Quiz[] = storedQuizzes ? JSON.parse(storedQuizzes) : [];
    const otherQuizzes = allQuizzes.filter(q => q.teacher_id !== DEMO_TEACHER_ID);
    localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify([...otherQuizzes, ...newQuizzes]));
    setQuizzes(newQuizzes);
  }, []);

  // Save results to localStorage
  const saveResults = useCallback((newResults: Result[], studentIds: number[]) => {
    const storedResults = localStorage.getItem(STORAGE_KEYS.results);
    const allResults: Result[] = storedResults ? JSON.parse(storedResults) : [];
    const otherResults = allResults.filter(r => !studentIds.includes(r.student_id));
    localStorage.setItem(STORAGE_KEYS.results, JSON.stringify([...otherResults, ...newResults]));
    setResults(newResults);
  }, []);

  // Add student
  const addStudent = useCallback((fullName: string) => {
    const newStudent: Student = {
      student_id: generateId(),
      teacher_id: DEMO_TEACHER_ID,
      full_name: fullName.trim(),
    };
    const updated = [...students, newStudent];
    saveStudents(updated);
  }, [students, saveStudents]);

  // Delete student (cascades to results)
  const deleteStudent = useCallback((studentId: number) => {
    const updatedStudents = students.filter(s => s.student_id !== studentId);
    const updatedResults = results.filter(r => r.student_id !== studentId);
    
    saveStudents(updatedStudents);
    saveResults(updatedResults, updatedStudents.map(s => s.student_id));
  }, [students, results, saveStudents, saveResults]);

  // Add quiz
  const addQuiz = useCallback((quizName: string, maxScore: number) => {
    const newQuiz: Quiz = {
      quiz_id: generateId(),
      teacher_id: DEMO_TEACHER_ID,
      quiz_name: quizName.trim(),
      max_score: maxScore,
    };
    const updated = [...quizzes, newQuiz];
    saveQuizzes(updated);
  }, [quizzes, saveQuizzes]);

  // Delete quiz (cascades to results)
  const deleteQuiz = useCallback((quizId: number) => {
    const updatedQuizzes = quizzes.filter(q => q.quiz_id !== quizId);
    const updatedResults = results.filter(r => r.quiz_id !== quizId);
    
    saveQuizzes(updatedQuizzes);
    saveResults(updatedResults, students.map(s => s.student_id));
  }, [quizzes, results, students, saveQuizzes, saveResults]);

  // Add or update result
  const addOrUpdateResult = useCallback((studentId: number, quizId: number, score: number) => {
    const quiz = quizzes.find(q => q.quiz_id === quizId);
    if (!quiz) return;

    const percent = Math.round((score / quiz.max_score) * 1000) / 10;
    
    const existingIndex = results.findIndex(r => r.student_id === studentId && r.quiz_id === quizId);
    
    let updatedResults: Result[];
    if (existingIndex >= 0) {
      updatedResults = [...results];
      updatedResults[existingIndex] = {
        ...updatedResults[existingIndex],
        score,
        percent,
        created_at: new Date().toISOString(),
      };
    } else {
      const newResult: Result = {
        result_id: generateId(),
        student_id: studentId,
        quiz_id: quizId,
        score,
        percent,
        created_at: new Date().toISOString(),
      };
      updatedResults = [...results, newResult];
    }
    
    saveResults(updatedResults, students.map(s => s.student_id));
  }, [quizzes, results, students, saveResults]);

  // Get students with their status for a specific quiz
  const getStudentsWithStatus = useCallback((quizId: number): StudentWithStatus[] => {
    return students.map(student => {
      const result = results.find(r => r.student_id === student.student_id && r.quiz_id === quizId);
      return {
        ...student,
        hasResult: !!result,
        score: result?.score,
        percent: result?.percent,
      };
    });
  }, [students, results]);

  // Get comprehensive stats for a student
  const getStudentStats = useCallback((studentId: number): StudentStats => {
    const studentResults = results.filter(r => r.student_id === studentId);
    const resultsWithQuiz = studentResults.map(r => {
      const quiz = quizzes.find(q => q.quiz_id === r.quiz_id);
      return {
        ...r,
        quiz_name: quiz?.quiz_name || 'Noma\'lum',
        max_score: quiz?.max_score || 0,
      };
    });

    const totalQuizzes = studentResults.length;
    const averagePercent = totalQuizzes > 0
      ? Math.round((studentResults.reduce((sum, r) => sum + r.percent, 0) / totalQuizzes) * 10) / 10
      : 0;

    return {
      totalQuizzes,
      averagePercent,
      results: resultsWithQuiz,
    };
  }, [results, quizzes]);

  // Get quiz with stats
  const getQuizWithStats = useCallback((quizId: number): QuizWithStats | null => {
    const quiz = quizzes.find(q => q.quiz_id === quizId);
    if (!quiz) return null;

    const quizResults = results.filter(r => r.quiz_id === quizId);
    const totalStudents = quizResults.length;
    const averageScore = totalStudents > 0
      ? Math.round((quizResults.reduce((sum, r) => sum + r.score, 0) / totalStudents) * 10) / 10
      : 0;
    const averagePercent = totalStudents > 0
      ? Math.round((quizResults.reduce((sum, r) => sum + r.percent, 0) / totalStudents) * 10) / 10
      : 0;

    return {
      ...quiz,
      totalStudents,
      averageScore,
      averagePercent,
    };
  }, [quizzes, results]);

  // Get all quizzes with stats
  const getAllQuizzesWithStats = useCallback((): QuizWithStats[] => {
    return quizzes.map(quiz => {
      const quizResults = results.filter(r => r.quiz_id === quiz.quiz_id);
      const totalStudents = quizResults.length;
      const averageScore = totalStudents > 0
        ? Math.round((quizResults.reduce((sum, r) => sum + r.score, 0) / totalStudents) * 10) / 10
        : 0;
      const averagePercent = totalStudents > 0
        ? Math.round((quizResults.reduce((sum, r) => sum + r.percent, 0) / totalStudents) * 10) / 10
        : 0;

      return {
        ...quiz,
        totalStudents,
        averageScore,
        averagePercent,
      };
    });
  }, [quizzes, results]);

  // Get overall statistics
  const getOverallStats = useCallback(() => {
    const totalStudents = students.length;
    const totalQuizzes = quizzes.length;
    const totalResults = results.length;
    const averagePercent = totalResults > 0
      ? Math.round((results.reduce((sum, r) => sum + r.percent, 0) / totalResults) * 10) / 10
      : 0;

    return { totalStudents, totalQuizzes, totalResults, averagePercent };
  }, [students, quizzes, results]);

  const value: DataContextType = {
    teacher,
    students,
    quizzes,
    results,
    isLoading,
    addStudent,
    deleteStudent,
    addQuiz,
    deleteQuiz,
    addOrUpdateResult,
    getStudentsWithStatus,
    getStudentStats,
    getQuizWithStats,
    getAllQuizzesWithStats,
    getOverallStats,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
