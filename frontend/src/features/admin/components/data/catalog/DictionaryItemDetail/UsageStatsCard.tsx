import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Activity } from 'lucide-react';
import React from 'react';

export const UsageStatsCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={cn('p-4 rounded-lg border shadow-sm', theme.surface.default, theme.border.default)}>
      <h4 className={cn('font-bold text-sm mb-3 flex items-center gap-2', theme.text.primary)}>
        <Activity className="h-4 w-4 text-blue-500" /> Usage Stats
      </h4>
      <div className={cn('space-y-2 text-xs', theme.text.secondary)}>
        <p>• Used in <strong>12</strong> Reports</p>
        <p>• Queried <strong>1.4k</strong> times (Last 30d)</p>
        <p>• <strong>3</strong> Downstream Dependencies</p>
      </div>
    </div>
  );
};
