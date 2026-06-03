import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Teacher, Page } from './types';

interface AppState {
  currentTeacher: Teacher | null;
  currentPage: Page;
  selectedQuizId: string | null;
  selectedStudentId: string | null;
  refreshKey: number;
}

interface AppContextType extends AppState {
  setTeacher: (t: Teacher | null) => void;
  navigate: (page: Page, params?: { quizId?: string; studentId?: string }) => void;
  refresh: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const savedTeacherId = localStorage.getItem('current_teacher_id');
    const savedTeacher = savedTeacherId
      ? (() => {
          try {
            const raw = localStorage.getItem('math_teacher_bot_db');
            if (raw) {
              const db = JSON.parse(raw);
              return db.teachers?.find((t: Teacher) => t.id === savedTeacherId) || null;
            }
          } catch {}
          return null;
        })()
      : null;

    return {
      currentTeacher: savedTeacher,
      currentPage: savedTeacher ? 'dashboard' : 'login',
      selectedQuizId: null,
      selectedStudentId: null,
      refreshKey: 0,
    };
  });

  const setTeacher = useCallback((t: Teacher | null) => {
    if (t) {
      localStorage.setItem('current_teacher_id', t.id);
    } else {
      localStorage.removeItem('current_teacher_id');
    }
    setState((s) => ({
      ...s,
      currentTeacher: t,
      currentPage: t ? 'dashboard' : 'login',
    }));
  }, []);

  const navigate = useCallback(
    (page: Page, params?: { quizId?: string; studentId?: string }) => {
      setState((s) => ({
        ...s,
        currentPage: page,
        selectedQuizId: params?.quizId ?? s.selectedQuizId,
        selectedStudentId: params?.studentId ?? s.selectedStudentId,
      }));
    },
    []
  );

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, refreshKey: s.refreshKey + 1 }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('current_teacher_id');
    setState({
      currentTeacher: null,
      currentPage: 'login',
      selectedQuizId: null,
      selectedStudentId: null,
      refreshKey: 0,
    });
  }, []);

  return (
    <AppContext.Provider
      value={{ ...state, setTeacher, navigate, refresh, logout }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
