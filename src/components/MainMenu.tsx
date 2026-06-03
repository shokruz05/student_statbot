import { PlusCircle, BarChart3, Users, GraduationCap } from 'lucide-react';

interface Props {
  onNavigate: (page: 'add-result' | 'statistics' | 'students') => void;
}

export default function MainMenu({ onNavigate }: Props) {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Журнал Преподавателя</h1>
        <p className="mt-1 text-sm text-slate-500">
          Управление результатами контрольных работ
        </p>
      </div>

      {/* Menu Buttons */}
      <div className="grid w-full max-w-sm gap-3">
        <button
          onClick={() => onNavigate('add-result')}
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100 active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-100 transition-transform group-hover:scale-110">
            <PlusCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">➕ Добавить результат</div>
            <div className="text-xs text-slate-500">Внести баллы за контрольную</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('statistics')}
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100 active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-md shadow-blue-100 transition-transform group-hover:scale-110">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">📊 Статистика</div>
            <div className="text-xs text-slate-500">Просмотр успеваемости учеников</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('students')}
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100 active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-md shadow-violet-100 transition-transform group-hover:scale-110">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">👥 Ученики</div>
            <div className="text-xs text-slate-500">Список учеников и управление</div>
          </div>
        </button>
      </div>
    </div>
  );
}
