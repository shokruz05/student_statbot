import { v4 as uuidv4 } from 'uuid';
import type { Teacher, Student, Quiz, Result } from './types';

const STORAGE_KEY = 'math_teacher_bot_db';

interface Database {
  teachers: Teacher[];
  students: Student[];
  quizzes: Quiz[];
  results: Result[];
}

function getDB(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { teachers: [], students: [], quizzes: [], results: [] };
}

function saveDB(db: Database): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── Teachers ────────────────────────────────────────
export function createTeacher(fullName: string, username: string): Teacher {
  const db = getDB();
  const teacher: Teacher = {
    id: uuidv4(),
    fullName,
    username,
    createdAt: new Date().toISOString(),
  };
  db.teachers.push(teacher);
  saveDB(db);
  return teacher;
}

export function getTeacherByUsername(username: string): Teacher | undefined {
  const db = getDB();
  return db.teachers.find(
    (t) => t.username.toLowerCase() === username.toLowerCase()
  );
}

export function getTeacher(id: string): Teacher | undefined {
  return getDB().teachers.find((t) => t.id === id);
}

export function getAllTeachers(): Teacher[] {
  return getDB().teachers;
}

export function updateTeacher(id: string, data: Partial<Teacher>): void {
  const db = getDB();
  const idx = db.teachers.findIndex((t) => t.id === id);
  if (idx !== -1) {
    db.teachers[idx] = { ...db.teachers[idx], ...data };
    saveDB(db);
  }
}

// ─── Students ────────────────────────────────────────
export function createStudent(teacherId: string, fullName: string): Student {
  const db = getDB();
  const student: Student = {
    id: uuidv4(),
    teacherId,
    fullName,
    createdAt: new Date().toISOString(),
  };
  db.students.push(student);
  saveDB(db);
  return student;
}

export function getStudentsByTeacher(teacherId: string): Student[] {
  return getDB().students.filter((s) => s.teacherId === teacherId);
}

export function getStudent(id: string): Student | undefined {
  return getDB().students.find((s) => s.id === id);
}

export function updateStudent(id: string, data: Partial<Student>): void {
  const db = getDB();
  const idx = db.students.findIndex((s) => s.id === id);
  if (idx !== -1) {
    db.students[idx] = { ...db.students[idx], ...data };
    saveDB(db);
  }
}

export function deleteStudent(id: string): void {
  const db = getDB();
  db.students = db.students.filter((s) => s.id !== id);
  db.results = db.results.filter((r) => r.studentId !== id);
  saveDB(db);
}

// ─── Quizzes ─────────────────────────────────────────
export function createQuiz(
  teacherId: string,
  quizName: string,
  maxScore: number
): Quiz {
  const db = getDB();
  const quiz: Quiz = {
    id: uuidv4(),
    teacherId,
    quizName,
    maxScore,
    createdAt: new Date().toISOString(),
  };
  db.quizzes.push(quiz);
  saveDB(db);
  return quiz;
}

export function getQuizzesByTeacher(teacherId: string): Quiz[] {
  return getDB().quizzes.filter((q) => q.teacherId === teacherId);
}

export function getQuiz(id: string): Quiz | undefined {
  return getDB().quizzes.find((q) => q.id === id);
}

export function updateQuiz(id: string, data: Partial<Quiz>): void {
  const db = getDB();
  const idx = db.quizzes.findIndex((q) => q.id === id);
  if (idx !== -1) {
    db.quizzes[idx] = { ...db.quizzes[idx], ...data };
    saveDB(db);
  }
}

export function deleteQuiz(id: string): void {
  const db = getDB();
  db.quizzes = db.quizzes.filter((q) => q.id !== id);
  db.results = db.results.filter((r) => r.quizId !== id);
  saveDB(db);
}

// ─── Results ─────────────────────────────────────────
export function addResult(
  teacherId: string,
  studentId: string,
  quizId: string,
  score: number
): Result {
  const db = getDB();
  const quiz = db.quizzes.find((q) => q.id === quizId);
  if (!quiz) throw new Error('Quiz not found');
  const percent = Math.round((score / quiz.maxScore) * 1000) / 10;

  // Check if result already exists for this student+quiz combo
  const existingIdx = db.results.findIndex(
    (r) => r.studentId === studentId && r.quizId === quizId
  );

  const result: Result = {
    id: existingIdx !== -1 ? db.results[existingIdx].id : uuidv4(),
    teacherId,
    studentId,
    quizId,
    score,
    percent,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    db.results[existingIdx] = result;
  } else {
    db.results.push(result);
  }

  saveDB(db);
  return result;
}

export function getResultsByStudent(studentId: string): Result[] {
  return getDB().results.filter((r) => r.studentId === studentId);
}

export function getResultsByQuiz(quizId: string): Result[] {
  return getDB().results.filter((r) => r.quizId === quizId);
}

export function getResultsByTeacher(teacherId: string): Result[] {
  return getDB().results.filter((r) => r.teacherId === teacherId);
}

export function getResultForStudentQuiz(
  studentId: string,
  quizId: string
): Result | undefined {
  return getDB().results.find(
    (r) => r.studentId === studentId && r.quizId === quizId
  );
}

export function deleteResult(id: string): void {
  const db = getDB();
  db.results = db.results.filter((r) => r.id !== id);
  saveDB(db);
}

// ─── Calculations ────────────────────────────────────
export function getStudentAveragePercent(studentId: string): {
  average: number;
  count: number;
} {
  const results = getResultsByStudent(studentId);
  if (results.length === 0) return { average: 0, count: 0 };
  const sum = results.reduce((acc, r) => acc + r.percent, 0);
  return {
    average: Math.round((sum / results.length) * 10) / 10,
    count: results.length,
  };
}

export function getQuizStats(quizId: string): {
  avgPercent: number;
  avgScore: number;
  count: number;
  maxScoreAchieved: number;
  minScoreAchieved: number;
} {
  const results = getResultsByQuiz(quizId);
  if (results.length === 0)
    return {
      avgPercent: 0,
      avgScore: 0,
      count: 0,
      maxScoreAchieved: 0,
      minScoreAchieved: 0,
    };
  const sumPercent = results.reduce((acc, r) => acc + r.percent, 0);
  const sumScore = results.reduce((acc, r) => acc + r.score, 0);
  const scores = results.map((r) => r.score);
  return {
    avgPercent: Math.round((sumPercent / results.length) * 10) / 10,
    avgScore: Math.round((sumScore / results.length) * 10) / 10,
    count: results.length,
    maxScoreAchieved: Math.max(...scores),
    minScoreAchieved: Math.min(...scores),
  };
}
