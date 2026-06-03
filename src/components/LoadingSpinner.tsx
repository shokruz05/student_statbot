import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</p>
        <p className="text-gray-400 text-sm mt-1">Iltimos, kuting</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
