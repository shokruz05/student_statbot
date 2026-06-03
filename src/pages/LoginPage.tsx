import { useState } from 'react';
import { useApp } from '../context';
import { createTeacher, getTeacherByUsername, getAllTeachers } from '../db';

export default function LoginPage() {
  const { setTeacher } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const teachers = getAllTeachers();

  const handleLogin = () => {
    if (!username.trim()) {
      setError("Foydalanuvchi nomini kiriting");
      return;
    }
    const teacher = getTeacherByUsername(username.trim());
    if (!teacher) {
      setError("Bunday foydalanuvchi topilmadi. Ro'yxatdan o'ting.");
      return;
    }
    setTeacher(teacher);
  };

  const handleRegister = () => {
    if (!fullName.trim() || !username.trim()) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    const existing = getTeacherByUsername(username.trim());
    if (existing) {
      setError("Bu foydalanuvchi nomi allaqachon mavjud");
      return;
    }
    const teacher = createTeacher(fullName.trim(), username.trim());
    setTeacher(teacher);
  };

  const handleQuickLogin = (teacherUsername: string) => {
    const teacher = getTeacherByUsername(teacherUsername);
    if (teacher) setTeacher(teacher);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 mb-4 animate-pulse-glow">
            <span className="text-4xl">📐</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Matematika Statistikasi
          </h1>
          <p className="text-slate-400 text-sm">
            O'quvchilar natijalarini boshqarish tizimi
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-slate-800/50 rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kirish
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="mb-4 animate-fade-in">
              <label className="block text-slate-300 text-sm mb-1.5 font-medium">
                To'liq ism (F.I.O)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Misol: Aliyev Sardor"
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-slate-300 text-sm mb-1.5 font-medium">
              Foydalanuvchi nomi
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Misol: sardor_teacher"
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  mode === 'login' ? handleLogin() : handleRegister();
                }
              }}
            />
          </div>

          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 active:scale-[0.98]"
          >
            {mode === 'login' ? '🔑 Kirish' : '✨ Kabinet yaratish'}
          </button>

          {/* Quick login for existing teachers */}
          {teachers.length > 0 && mode === 'login' && (
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-xs mb-3 text-center uppercase tracking-wider">
                Mavjud kabinetlar
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {teachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleQuickLogin(t.username)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-700/50 rounded-xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.fullName.charAt(0)}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {t.fullName}
                      </div>
                      <div className="text-slate-500 text-xs truncate">
                        @{t.username}
                      </div>
                    </div>
                    <span className="ml-auto text-slate-500 group-hover:text-primary-400 transition-colors text-lg">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Ishlab chiquvchi: <span className="text-slate-500">@kvonyeon</span>
        </p>
      </div>
    </div>
  );
}
