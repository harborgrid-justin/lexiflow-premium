
import React from 'react';
import { Card } from './Card';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string; // e.g. text-blue-600
  bg?: string; // e.g. bg-blue-50
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, bg, trend }) => {
  const { theme } = useTheme();
  
  return (
    <Card className="flex items-center justify-between" noPadding={false}>
      <div>
        <p className={cn("text-sm font-medium", theme.text.secondary)}>{label}</p>
        <p className={cn("text-3xl font-bold mt-1 tracking-tight", theme.text.primary)}>{value}</p>
        {trend && <p className={cn("text-xs mt-1", theme.text.tertiary)}>{trend}</p>}
      </div>
      <div className={cn("p-3 rounded-full", bg || theme.surfaceHighlight)}>
        <Icon className={cn("h-6 w-6", color || theme.primary.text)} />
      </div>
    </Card>
  );
};
