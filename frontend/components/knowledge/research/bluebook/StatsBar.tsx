import React from 'react';
import { Card } from '../../../common/Card';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import type { FormatStats } from './types';

interface StatsBarProps {
  stats: FormatStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className={cn("text-xs uppercase", theme.text.tertiary)}>Total</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
        <div className={cn("text-xs uppercase", theme.text.tertiary)}>Valid</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-amber-600">{stats.warnings}</div>
        <div className={cn("text-xs uppercase", theme.text.tertiary)}>Warnings</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
        <div className={cn("text-xs uppercase", theme.text.tertiary)}>Errors</div>
      </Card>
    </div>
  );
};
