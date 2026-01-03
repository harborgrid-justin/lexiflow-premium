/**
 * @module components/common/TabNavigation
 * @category Common
 * @description Tab navigation with icons and active state.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useId } from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface TabNavigationItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabNavigationProps {
  tabs: TabNavigationItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

/**
 * TabNavigation - React 18 optimized with React.memo and useId
 */
export const TabNavigation = React.memo<TabNavigationProps>(({ tabs, activeTab, onTabChange, className = '' }) => {
  const { theme } = useTheme();
  const navId = useId();

  return (
    <div className={cn("border-b", theme.border.default, className)}>
      <nav id={navId} className="flex space-x-2 overflow-x-auto no-scrollbar px-2" aria-label="Tabs" role="tablist">
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
                  : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`, `hover:${theme.border.default}`)
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
});

// React.memo displayName for debugging (Principle #13)
TabNavigation.displayName = 'TabNavigation';
