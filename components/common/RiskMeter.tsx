
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
      if (val >= 80) return theme.chart.colors.success; // Green
      if (val >= 50) return theme.chart.colors.primary; // Blue
      return theme.chart.colors.warning; // Amber
    } else { // Risk
      if (val >= 80) return theme.chart.colors.danger; // Red
      if (val >= 50) return theme.chart.colors.warning; // Amber
      return theme.chart.colors.success; // Green (Low risk is good)
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
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: getColor(value) }} 
        />
      </div>
    </div>
  );
};
