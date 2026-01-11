/**
 * @file VisualDesignerPanel.tsx
 * @description Visual workflow canvas with quick action buttons
 */

import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { Boxes, Clock, Database, GitBranch, Layers, UserCheck, Webhook } from 'lucide-react';
import React from 'react';

interface VisualDesignerPanelProps {
  onAddConditionalBranch: () => void;
  onAddParallelExecution: () => void;
  onAddSLA: () => void;
  onAddApprovalChain: () => void;
  onCreateSnapshot: () => void;
  onCreateWebhook: () => void;
}

export const VisualDesignerPanel: React.FC<VisualDesignerPanelProps> = ({
  onAddConditionalBranch,
  onAddParallelExecution,
  onAddSLA,
  onAddApprovalChain,
  onCreateSnapshot,
  onCreateWebhook,
}) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <Card title="Visual Workflow Canvas">
        <div className={cn("h-96 rounded-lg border-2 border-dashed flex items-center justify-center", theme.border.default)}>
          <div className="text-center">
            <Layers className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <p className={cn("font-medium", theme.text.primary)}>
              Drag & Drop Workflow Builder
            </p>
            <p className={cn("text-sm mt-2", theme.text.secondary)}>
              Click nodes to configure advanced features
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" icon={GitBranch} onClick={onAddConditionalBranch}>
          Add Conditional Branch
        </Button>
        <Button variant="outline" icon={Boxes} onClick={onAddParallelExecution}>
          Add Parallel Execution
        </Button>
        <Button variant="outline" icon={Clock} onClick={onAddSLA}>
          Enable SLA Monitoring
        </Button>
        <Button variant="outline" icon={UserCheck} onClick={onAddApprovalChain}>
          Add Approval Chain
        </Button>
        <Button variant="outline" icon={Database} onClick={onCreateSnapshot}>
          Create Snapshot
        </Button>
        <Button variant="outline" icon={Webhook} onClick={onCreateWebhook}>
          Create Webhook Trigger
        </Button>
      </div>
    </div>
  );
};
