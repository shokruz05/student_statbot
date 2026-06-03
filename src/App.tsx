import { useState, useEffect, useCallback } from 'react';
import MainMenu from './components/MainMenu';
import AddResultFlow from './components/AddResultFlow';
import Statistics from './components/Statistics';
import Students from './components/Students';
import Toast, { type ToastData } from './components/Toast';
import { seedDemoData } from './db';

type Page = 'menu' | 'add-result' | 'statistics' | 'students';

export default function App() {
  const [page, setPage] = useState<Page>('menu');
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    seedDemoData().then(() => setInitialized(true));
  }, []);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Toast notifications */}
      <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Telegram-like header */}
      <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold shadow-md">
            📐
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-slate-900">Журнал Математика</h1>
            <p className="text-[11px] text-slate-500">
              {page === 'menu' && 'Главное меню'}
              {page === 'add-result' && '➕ Добавление результата'}
              {page === 'statistics' && '📊 Статистика'}
              {page === 'students' && '👥 Управление учениками'}
            </p>
          </div>
          {page !== 'menu' && (
            <button
              onClick={() => setPage('menu')}
              className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
            >
              🏠 Меню
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg px-4 py-6">
        {page === 'menu' && (
          <MainMenu onNavigate={(p) => setPage(p)} />
        )}

        {page === 'add-result' && (
          <AddResultFlow
            onBack={() => setPage('menu')}
            onToast={addToast}
          />
        )}

        {page === 'statistics' && (
          <Statistics onBack={() => setPage('menu')} />
        )}

        {page === 'students' && (
          <Students
            onBack={() => setPage('menu')}
            onToast={addToast}
          />
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
          <button
            onClick={() => setPage('add-result')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] font-medium transition ${
              page === 'add-result'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="text-lg">➕</span>
            Результат
          </button>
          <button
            onClick={() => setPage('statistics')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] font-medium transition ${
              page === 'statistics'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="text-lg">📊</span>
            Статистика
          </button>
          <button
            onClick={() => setPage('students')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] font-medium transition ${
              page === 'students'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="text-lg">👥</span>
            Ученики
          </button>
        </div>
      </div>
    </div>
  );
}
