/**
 * Tab navigation component
 */

import { cn } from '@/shared/lib/cn';
import { LucideIcon } from 'lucide-react';

export interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface TabBarProps {
  tabs: readonly Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-2 mt-6 overflow-x-auto">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap",
              isActive
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
