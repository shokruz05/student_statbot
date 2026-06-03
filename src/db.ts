import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ─── Schema Interfaces ────────────────────────────────────
export interface Student {
  student_id?: number;
  full_name: string;
}

export interface Quiz {
  quiz_id?: number;
  quiz_name: string;
  max_score: number;
}

export interface Result {
  result_id?: number;
  student_id: number;
  quiz_id: number;
  score: number;
  percent: number;
  created_at: string;
}

// ─── IndexedDB Schema ─────────────────────────────────────
interface GradeBookDB extends DBSchema {
  students: {
    key: number;
    value: Student;
    indexes: { 'by-name': string };
  };
  quizzes: {
    key: number;
    value: Quiz;
    indexes: { 'by-name': string };
  };
  results: {
    key: number;
    value: Result;
    indexes: {
      'by-student': number;
      'by-quiz': number;
      'by-student-quiz': [number, number];
    };
  };
}

let dbInstance: IDBPDatabase<GradeBookDB> | null = null;

async function getDB(): Promise<IDBPDatabase<GradeBookDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<GradeBookDB>('gradebook', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const studentStore = db.createObjectStore('students', {
          keyPath: 'student_id',
          autoIncrement: true,
        });
        studentStore.createIndex('by-name', 'full_name');

        const quizStore = db.createObjectStore('quizzes', {
          keyPath: 'quiz_id',
          autoIncrement: true,
        });
        quizStore.createIndex('by-name', 'quiz_name');

        const resultStore = db.createObjectStore('results', {
          keyPath: 'result_id',
          autoIncrement: true,
        });
        resultStore.createIndex('by-student', 'student_id');
        resultStore.createIndex('by-quiz', 'quiz_id');
        resultStore.createIndex('by-student-quiz', ['student_id', 'quiz_id']);
      }
    },
  });

  return dbInstance;
}

// ─── Student Operations ───────────────────────────────────
export async function getAllStudents(): Promise<Student[]> {
  const db = await getDB();
  const students = await db.getAll('students');
  return students.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ru'));
}

export async function addStudent(full_name: string): Promise<Student> {
  const db = await getDB();
  const id = await db.add('students', { full_name } as Student);
  return { student_id: id, full_name };
}

export async function deleteStudent(student_id: number): Promise<void> {
  const db = await getDB();
  // Delete all results for this student
  const results = await db.getAllFromIndex('results', 'by-student', student_id);
  const tx = db.transaction('results', 'readwrite');
  for (const r of results) {
    if (r.result_id) await tx.store.delete(r.result_id);
  }
  await tx.done;
  await db.delete('students', student_id);
}

export async function updateStudent(student_id: number, full_name: string): Promise<void> {
  const db = await getDB();
  await db.put('students', { student_id, full_name });
}

export async function getStudent(student_id: number): Promise<Student | undefined> {
  const db = await getDB();
  return db.get('students', student_id);
}

// ─── Quiz Operations ──────────────────────────────────────
export async function getAllQuizzes(): Promise<Quiz[]> {
  const db = await getDB();
  return db.getAll('quizzes');
}

export async function addQuiz(quiz_name: string, max_score: number): Promise<Quiz> {
  const db = await getDB();
  const id = await db.add('quizzes', { quiz_name, max_score } as Quiz);
  return { quiz_id: id, quiz_name, max_score };
}

export async function deleteQuiz(quiz_id: number): Promise<void> {
  const db = await getDB();
  const results = await db.getAllFromIndex('results', 'by-quiz', quiz_id);
  const tx = db.transaction('results', 'readwrite');
  for (const r of results) {
    if (r.result_id) await tx.store.delete(r.result_id);
  }
  await tx.done;
  await db.delete('quizzes', quiz_id);
}

export async function getQuiz(quiz_id: number): Promise<Quiz | undefined> {
  const db = await getDB();
  return db.get('quizzes', quiz_id);
}

// ─── Result Operations ────────────────────────────────────
export async function addResult(
  student_id: number,
  quiz_id: number,
  score: number,
  max_score: number
): Promise<{ result: Result; totalWorks: number; averagePercent: number }> {
  const db = await getDB();
  const percent = Math.round((score / max_score) * 1000) / 10; // round to 1 decimal

  const result: Result = {
    student_id,
    quiz_id,
    score,
    percent,
    created_at: new Date().toISOString(),
  };

  const id = await db.add('results', result);
  result.result_id = id;

  // Calculate average across all results for this student
  const allResults = await db.getAllFromIndex('results', 'by-student', student_id);
  const totalWorks = allResults.length;
  const sumPercent = allResults.reduce((sum, r) => sum + r.percent, 0);
  const averagePercent = Math.round((sumPercent / totalWorks) * 10) / 10;

  return { result, totalWorks, averagePercent };
}

export async function getResultsForStudent(student_id: number): Promise<Result[]> {
  const db = await getDB();
  return db.getAllFromIndex('results', 'by-student', student_id);
}

export async function getResultsForQuiz(quiz_id: number): Promise<Result[]> {
  const db = await getDB();
  return db.getAllFromIndex('results', 'by-quiz', quiz_id);
}

export async function getResultForStudentQuiz(
  student_id: number,
  quiz_id: number
): Promise<Result | undefined> {
  const db = await getDB();
  const results = await db.getAllFromIndex(
    'results',
    'by-student-quiz',
    [student_id, quiz_id]
  );
  return results[0];
}

export async function getStudentStats(student_id: number): Promise<{
  totalWorks: number;
  averagePercent: number;
  results: (Result & { quiz_name: string; max_score: number })[];
}> {
  const db = await getDB();
  const results = await db.getAllFromIndex('results', 'by-student', student_id);
  const quizzes = await db.getAll('quizzes');
  const quizMap = new Map(quizzes.map((q) => [q.quiz_id!, q]));

  const enriched = results.map((r) => {
    const quiz = quizMap.get(r.quiz_id);
    return {
      ...r,
      quiz_name: quiz?.quiz_name ?? 'Неизвестно',
      max_score: quiz?.max_score ?? 0,
    };
  });

  enriched.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalWorks = results.length;
  const averagePercent =
    totalWorks > 0
      ? Math.round((results.reduce((s, r) => s + r.percent, 0) / totalWorks) * 10) / 10
      : 0;

  return { totalWorks, averagePercent, results: enriched };
}

export async function deleteResult(result_id: number): Promise<void> {
  const db = await getDB();
  await db.delete('results', result_id);
}

export async function updateResult(
  result_id: number,
  score: number,
  max_score: number,
  student_id: number,
  quiz_id: number
): Promise<void> {
  const db = await getDB();
  const percent = Math.round((score / max_score) * 1000) / 10;
  const existing = await db.get('results', result_id);
  if (existing) {
    await db.put('results', {
      ...existing,
      score,
      percent,
      student_id,
      quiz_id,
    });
  }
}

// ─── Seeding Demo Data ────────────────────────────────────
export async function seedDemoData(): Promise<void> {
  const db = await getDB();
  const existingStudents = await db.count('students');
  if (existingStudents > 0) return;

  const studentNames = [
    'Абрамов Дмитрий',
    'Белова Анна',
    'Васильев Артём',
    'Громова Екатерина',
    'Давыдов Максим',
    'Егорова Мария',
    'Жуков Александр',
    'Захарова Ольга',
    'Иванов Иван',
    'Козлова Светлана',
    'Лебедев Никита',
    'Морозова Виктория',
    'Николаев Сергей',
    'Орлова Дарья',
    'Петров Алексей',
    'Романова Елена',
    'Смирнов Кирилл',
    'Тихонова Юлия',
    'Ульянов Владимир',
    'Фёдорова Полина',
    'Харитонов Егор',
    'Цветкова Алиса',
  ];

  for (const name of studentNames) {
    await db.add('students', { full_name: name } as Student);
  }
}
