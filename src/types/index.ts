// Database Types matching the SQLite schema

export interface Teacher {
  teacher_id: number;
  username: string;
  registered_at: string;
}

export interface Student {
  student_id: number;
  teacher_id: number;
  full_name: string;
}

export interface Quiz {
  quiz_id: number;
  teacher_id: number;
  quiz_name: string;
  max_score: number;
}

export interface Result {
  result_id: number;
  student_id: number;
  quiz_id: number;
  score: number;
  percent: number;
  created_at: string;
}

// Extended types for UI
export interface StudentWithStatus extends Student {
  hasResult: boolean;
  score?: number;
  percent?: number;
}

export interface StudentStats {
  totalQuizzes: number;
  averagePercent: number;
  results: ResultWithQuiz[];
}

export interface ResultWithQuiz extends Result {
  quiz_name: string;
  max_score: number;
}

export interface QuizWithStats extends Quiz {
  totalStudents: number;
  averageScore: number;
  averagePercent: number;
}

// Navigation/View types
export type ViewType = 
  | 'dashboard' 
  | 'add-result' 
  | 'students' 
  | 'new-quiz' 
  | 'delete-quiz'
  | 'student-detail'
  | 'quiz-detail';

export interface AppState {
  currentView: ViewType;
  selectedQuizId: number | null;
  selectedStudentId: number | null;
}
