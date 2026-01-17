import { Card } from '@/components/molecules/Card/Card';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import type { FormatStats } from './types';

interface StatsBarProps {
  stats: FormatStats;
}

export function StatsBar({ stats }: StatsBarProps) {
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
