
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface RiskMeterProps {
  value: number; // 0 to 100
  label?: string;
  type?: 'strength' | 'risk';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ value, label, type = 'strength' }) => {
  const { theme } = useTheme();

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
          <span className={cn("font-semibold uppercase", theme.text.secondary)}>{label}</span>
          <span className={cn("font-bold", theme.text.primary)}>{value}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full h-2 overflow-hidden", theme.surfaceHighlight)}>
        <div 
          className={`${getColor(value)} h-full rounded-full transition-all duration-500`} 
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }} 
        />
      </div>
    </div>
  );
};
