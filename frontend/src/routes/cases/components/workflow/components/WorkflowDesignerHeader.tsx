/**
 * @file WorkflowDesignerHeader.tsx
 * @description Header section for Advanced Workflow Designer with title and action buttons
 */

import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Play, Save } from 'lucide-react';
import type { EnhancedWorkflowInstance } from '@/types/workflow-advanced-types';

interface WorkflowDesignerHeaderProps {
  workflow: EnhancedWorkflowInstance | undefined;
  onSave?: (workflow: EnhancedWorkflowInstance) => void;
}

export function WorkflowDesignerHeader({
  workflow,
  onSave,
}: WorkflowDesignerHeaderProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("border-b px-6 py-4", theme.surface.default, theme.border.default)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-2xl font-bold", theme.text.primary)}>
            Advanced Workflow Designer
          </h1>
          <p className={cn("text-sm mt-1", theme.text.secondary)}>
            10 Elite Features • Backend-Integrated • PhD-Grade Engineering
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Save} onClick={() => onSave?.(workflow!)}>
            Save
          </Button>
          <Button variant="primary" icon={Play}>
            Execute Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}

WorkflowDesignerHeader.displayName = 'WorkflowDesignerHeader';
