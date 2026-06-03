import React, { useEffect } from 'react';

interface SuccessToastProps {
  message: string;
  subMessage?: string;
  onClose: () => void;
  duration?: number;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ 
  message, 
  subMessage, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-20 left-4 right-4 z-[100] animate-slide-down">
      <div className="bg-emerald-500 text-white rounded-xl p-4 shadow-lg shadow-emerald-200/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">✅</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">{message}</p>
            {subMessage && (
              <p className="text-sm text-emerald-100 mt-0.5">{subMessage}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;
