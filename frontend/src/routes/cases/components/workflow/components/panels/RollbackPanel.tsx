/**
 * @file RollbackPanel.tsx
 * @description State snapshots and rollback functionality
 */

import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { Database, Undo2 } from 'lucide-react';
import type { WorkflowSnapshot } from '@/types/workflow-advanced-types';

interface RollbackPanelProps {
  snapshots: WorkflowSnapshot[];
  onCreateSnapshot: () => void;
  onRollback: (snapshotId: string) => void;
}

export function RollbackPanel({
  snapshots,
  onCreateSnapshot,
  onRollback,
}: RollbackPanelProps) {
  const { theme } = useTheme();

  return (
    <Card title="State Snapshots & Rollback">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm", theme.text.secondary)}>
            Temporal workflow restoration with one-click rollback
          </p>
          <Button icon={Database} onClick={onCreateSnapshot}>
            Create Snapshot
          </Button>
        </div>

        <div className="space-y-2">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span className={cn("font-medium text-sm", theme.text.primary)}>
                      {snapshot.label || `Snapshot #${snapshot.version}`}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      snapshot.type === 'milestone' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
                    )}>
                      {snapshot.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", theme.text.tertiary)}>
                    {snapshot.createdAt} • {(snapshot.sizeBytes / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Undo2}
                  onClick={() => onRollback(snapshot.id)}
                >
                  Rollback
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

RollbackPanel.displayName = 'RollbackPanel';
