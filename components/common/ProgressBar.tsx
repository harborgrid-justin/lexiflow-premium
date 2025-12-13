
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  label: string;
  value: number; // 0-100
  colorClass?: string;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  colorClass,
  showValue = true
}) => {
  const { theme } = useTheme();
  
  return (
    <div>
      <div className={cn("flex justify-between text-sm mb-1", theme.text.secondary)}>
        <span id={`progress-label-${label.replace(/\s+/g, '-').toLowerCase()}`}>{label}</span>
        {showValue && <span className={cn("font-bold", theme.text.primary)}>{value}%</span>}
      </div>
      <div 
        className={cn("w-full rounded-full h-2", theme.surface.highlight)}
        role="progressbar"
        aria-labelledby={`progress-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-2 rounded-full", colorClass || theme.primary.DEFAULT)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        ></div>
      </div>
    </div>
  );
};
