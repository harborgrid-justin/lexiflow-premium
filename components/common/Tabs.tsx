
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps {
  tabs: (string | TabItem)[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
  variant?: 'pills' | 'underline' | 'segmented';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '', variant = 'segmented' }) => {
  const { theme } = useTheme();
  
  // Normalizing tabs to objects
  const normalizedTabs: TabItem[] = tabs.map(t =>
    typeof t === 'string' ? { id: t, label: t.charAt(0).toUpperCase() + t.slice(1).replace(/([A-Z])/g, ' $1').trim() } : t
  );

  if (variant === 'underline') {
    return (
      <div className={cn("border-b w-full", theme.border.default, className)}>
        <nav className="-mb-px flex space-x-6 px-4" aria-label="Tabs">
          {normalizedTabs.map((tab) => {
             const isActive = activeTab === tab.id;
             const Icon = tab.icon;
             return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-all duration-200 flex items-center gap-2 relative top-px",
                  isActive
                    ? cn("border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400")
                    : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`, `hover:border-slate-300`)
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {Icon && <Icon className={cn("h-4 w-4", isActive ? "text-current" : theme.text.tertiary)} />}
                {tab.label}
              </button>
             );
          })}
        </nav>
      </div>
    );
  }

  // Default Segmented Style
  return (
    <div className={cn("inline-flex rounded-lg p-1 border", theme.surface.highlight, theme.border.default, className)}>
      {normalizedTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 min-w-[80px]",
              isActive
                ? cn(theme.surface.default, theme.text.primary, "shadow-sm ring-1 ring-black/5")
                : cn("bg-transparent text-slate-500 hover:text-slate-700")
            )}
          >
            {Icon && <Icon className={cn("h-3.5 w-3.5", isActive ? theme.primary.text : "opacity-70")} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};