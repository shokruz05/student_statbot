export interface Teacher {
  id: string;
  fullName: string;
  username: string;
  createdAt: string;
}

export interface Student {
  id: string;
  teacherId: string;
  fullName: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  teacherId: string;
  quizName: string;
  maxScore: number;
  createdAt: string;
}

export interface Result {
  id: string;
  teacherId: string;
  studentId: string;
  quizId: string;
  score: number;
  percent: number;
  createdAt: string;
}

export type Page =
  | 'login'
  | 'dashboard'
  | 'add-result'
  | 'statistics'
  | 'students'
  | 'quizzes'
  | 'student-detail'
  | 'quiz-detail'
  | 'settings';
