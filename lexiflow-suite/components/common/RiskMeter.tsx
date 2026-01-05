
import React from 'react';

interface RiskMeterProps {
  value: number; // 0 to 100
  label?: string;
  type?: 'strength' | 'risk';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ value, label, type = 'strength' }) => {
  const getColor = (val: number) => {
    if (type === 'strength') {
      if (val >= 80) return 'bg-green-500';
      if (val >= 50) return 'bg-blue-500';
      return 'bg-amber-500';
    } else { // Risk
      if (val >= 80) return 'bg-red-500';
      if (val >= 50) return 'bg-amber-500';
      return 'bg-green-500'; // Low risk is good
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold uppercase">{label}</span>
          <span className="font-bold text-slate-900">{value}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div 
          className={`${getColor(value)} h-full rounded-full transition-all duration-500`} 
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }} 
        />
      </div>
    </div>
  );
};
