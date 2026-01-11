/**
 * @file ConditionalBranchingPanel.tsx
 * @description Conditional branching configuration with rule-based decision trees
 */

import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, CheckCircle2, GitBranch } from 'lucide-react';
import React from 'react';

export const ConditionalBranchingPanel: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <Card title="Conditional Branching Engine">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={cn("font-semibold", theme.text.primary)}>
                Rule-Based Decision Trees
              </h4>
              <p className={cn("text-sm mt-1", theme.text.secondary)}>
                Complex logical expressions with AND/OR/XOR/NAND/NOR operators
              </p>
            </div>
            <Button icon={GitBranch}>Add Rule</Button>
          </div>

          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className={cn("font-medium text-sm", theme.text.primary)}>
                  Evaluation Strategy: First Match
                </p>
                <p className={cn("text-xs mt-1", theme.text.tertiary)}>
                  Branches evaluated by priority, stops at first match
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-3" />
            <p className={cn("font-medium", theme.text.primary)}>
              No conditional branches configured
            </p>
            <p className={cn("text-sm mt-1", theme.text.secondary)}>
              Add a node and click "Add Conditional Branch" in the designer
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
