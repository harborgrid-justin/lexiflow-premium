
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("border-b", theme.border.default, className)}>
      <nav className="flex space-x-2 overflow-x-auto no-scrollbar px-2" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors min-w-fit",
                isActive
                  ? cn(theme.primary.text, "border-current")
                  : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`, `hover:${theme.border.light}`)
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && <Icon className={cn("h-4 w-4", isActive ? theme.primary.text : theme.text.tertiary)} />}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
