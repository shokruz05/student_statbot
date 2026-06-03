import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastData {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface Props {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

export default function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 fade-in duration-300 ${
        toast.type === 'success'
          ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
          : 'border-red-200 bg-red-50/95 text-red-800'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      )}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-0.5 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
