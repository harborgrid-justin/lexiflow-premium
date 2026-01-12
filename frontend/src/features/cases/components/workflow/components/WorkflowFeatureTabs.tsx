/**
 * @file WorkflowFeatureTabs.tsx
 * @description Tab navigation for workflow designer features
 */

import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type FeatureTab =
  | 'designer'
  | 'conditional'
  | 'parallel'
  | 'versions'
  | 'sla'
  | 'approvals'
  | 'rollback'
  | 'analytics'
  | 'ai'
  | 'triggers';

export interface FeatureTabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface WorkflowFeatureTabsProps {
  activeTab: FeatureTab;
  onTabChange: (tab: FeatureTab) => void;
  tabs: FeatureTabConfig[];
}

export const WorkflowFeatureTabs: React.FC<WorkflowFeatureTabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("border-b", theme.border.default)}>
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as FeatureTab)}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`),
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
