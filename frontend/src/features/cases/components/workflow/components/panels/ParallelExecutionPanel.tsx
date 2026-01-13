/**
 * @file ParallelExecutionPanel.tsx
 * @description Parallel execution configuration with join strategies
 */

import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Boxes } from 'lucide-react';
import React from 'react';

export function ParallelExecutionPanel() {
  const { theme } = useTheme();

  return (
    <Card title="Parallel Execution System">
      <div className="space-y-4">
        <div className={cn("grid grid-cols-3 gap-4 p-4 rounded-lg", theme.surface.highlight)}>
          <div>
            <p className={cn("text-xs", theme.text.tertiary)}>Join Strategy</p>
            <p className={cn("text-sm font-bold mt-1", theme.text.primary)}>Wait All</p>
          </div>
          <div>
            <p className={cn("text-xs", theme.text.tertiary)}>Load Balancing</p>
            <p className={cn("text-sm font-bold mt-1", theme.text.primary)}>Round Robin</p>
          </div>
          <div>
            <p className={cn("text-xs", theme.text.tertiary)}>Error Handling</p>
            <p className={cn("text-sm font-bold mt-1", theme.text.primary)}>Fail Fast</p>
          </div>
        </div>

        <div className="text-center py-8">
          <Boxes className="h-12 w-12 mx-auto text-orange-500 mb-3" />
          <p className={cn("font-medium", theme.text.primary)}>
            Configure concurrent task execution
          </p>
          <p className={cn("text-sm mt-1", theme.text.secondary)}>
            Split workflow into parallel branches with advanced join strategies
          </p>
        </div>
      </div>
    </Card>
  );
}

ParallelExecutionPanel.displayName = 'ParallelExecutionPanel';
