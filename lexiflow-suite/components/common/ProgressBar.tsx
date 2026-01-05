
import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number; // 0-100
  colorClass?: string;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  label, 
  value, 
  colorClass = "bg-blue-600",
  showValue = true 
}) => {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        {showValue && <span className="font-bold">{value}%</span>}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className={`${colorClass} h-2 rounded-full`} 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        ></div>
      </div>
    </div>
  );
};
