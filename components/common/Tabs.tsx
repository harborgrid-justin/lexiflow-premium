
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
      <div className={cn("border-b overflow-x-auto no-scrollbar", theme.border.default, className)}>
        <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-full px-2 md:px-0" aria-label="Tabs">
          {normalizedTabs.map((tab) => {
             const isActive = activeTab === tab.id;
             const Icon = tab.icon;
             return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 py-3 px-2 md:px-1 text-sm font-medium transition-colors min-h-[44px] touch-manipulation flex items-center gap-2",
                  isActive 
                    ? cn("border-blue-600", theme.primary.text) 
                    : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`, `hover:${theme.border.default}`)
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
    <div className={cn("inline-flex rounded-lg p-1 overflow-x-auto max-w-full", theme.surfaceHighlight, className)}>
      {normalizedTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-2 text-xs md:text-sm font-semibold ring-1 ring-inset transition-all min-h-[36px] touch-manipulation flex items-center justify-center gap-2",
              isActive 
                ? cn(theme.surface, theme.text.primary, "shadow-sm ring-black/5") 
                : cn("bg-transparent ring-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
            )}
          >
            {Icon && <Icon className={cn("h-3.5 w-3.5", isActive ? theme.primary.text : theme.text.tertiary)} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
