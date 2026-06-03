import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  green: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
  pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color, onClick }) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`${colorClasses[color]} rounded-2xl p-4 text-white shadow-lg transform transition-all hover:scale-[1.02] ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/80 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subValue && (
            <p className="text-xs text-white/70 mt-1">{subValue}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </Component>
  );
};

export default StatCard;
