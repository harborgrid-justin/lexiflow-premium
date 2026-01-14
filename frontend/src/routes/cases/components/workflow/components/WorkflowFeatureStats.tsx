/**
 * @file WorkflowFeatureStats.tsx
 * @description Feature statistics banner showing workflow metrics
 */

import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { Boxes, Clock, GitBranch, Sparkles, UserCheck } from 'lucide-react';
import type { AIWorkflowSuggestion, EnhancedWorkflowInstance } from '@/types/workflow-advanced-types';

interface WorkflowFeatureStatsProps {
  workflow: EnhancedWorkflowInstance | undefined;
  aiSuggestions: AIWorkflowSuggestion[];
}

export function WorkflowFeatureStats({
  workflow,
  aiSuggestions,
}: WorkflowFeatureStatsProps) {
  const { theme } = useTheme();

  const stats = [
    {
      icon: GitBranch,
      label: 'Conditionals',
      value: workflow?.conditionalConfigs?.length || 0,
      color: 'text-purple-500',
    },
    {
      icon: Boxes,
      label: 'Parallel',
      value: workflow?.parallelConfigs?.length || 0,
      color: 'text-orange-500',
    },
    {
      icon: Clock,
      label: 'SLA Tracked',
      value: workflow?.slaConfigs?.length || 0,
      color: 'text-blue-500',
    },
    {
      icon: UserCheck,
      label: 'Approval Chains',
      value: workflow?.approvalChains?.length || 0,
      color: 'text-green-500',
    },
    {
      icon: Sparkles,
      label: 'AI Suggestions',
      value: aiSuggestions.length,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className={cn("border-b px-6 py-3", theme.surface.highlight, theme.border.default)}>
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
            <div>
              <p className={cn("text-xs", theme.text.tertiary)}>{stat.label}</p>
              <p className={cn("text-sm font-bold", theme.text.primary)}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

WorkflowFeatureStats.displayName = 'WorkflowFeatureStats';
