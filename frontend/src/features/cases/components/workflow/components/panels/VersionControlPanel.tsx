/**
 * @file VersionControlPanel.tsx
 * @description Workflow version control with Git-style versioning
 */

import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { GitCompare } from 'lucide-react';
import React from 'react';
import type { WorkflowVersion } from '@/types/workflow-advanced-types';

interface VersionControlPanelProps {
  versions: WorkflowVersion[];
  onCreateVersion: (message: string) => void;
}

export function VersionControlPanel({
  versions,
  onCreateVersion,
}: VersionControlPanelProps) {
  const { theme } = useTheme();

  return (
    <Card title="Workflow Version Control">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm", theme.text.secondary)}>
            Git-style versioning with diff visualization
          </p>
          <Button icon={GitCompare} onClick={() => onCreateVersion('Feature update')}>
            Create Version
          </Button>
        </div>

        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono text-sm font-bold", theme.text.primary)}>
                      v{version.version}
                    </span>
                    {version.status === 'published' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                        Published
                      </span>
                    )}
                  </div>
                  <p className={cn("text-sm mt-1", theme.text.secondary)}>
                    {version.commitMessage}
                  </p>
                  <p className={cn("text-xs mt-1", theme.text.tertiary)}>
                    {version.createdAt} • {version.author}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Compare
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

VersionControlPanel.displayName = 'VersionControlPanel';
