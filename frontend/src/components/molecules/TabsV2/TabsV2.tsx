/**
 * @module components/common/TabsV2
 * @category Common
 * @description Two-level tab navigation system matching TabbedPageLayout design.
 *
 * Features:
 * - Parent tabs with underline style
 * - Sub-tabs with pill/badge style
 * - Icon support for both levels
 * - Keyboard navigation
 * - Responsive design
 * - Theme integration
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

import React, { useRef } from 'react';
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SubTabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

export interface ParentTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  subTabs: SubTabItem[];
  disabled?: boolean;
}

interface TabsV2Props {
  /** Array of parent tabs with nested sub-tabs */
  tabs: ParentTabItem[];
  /** Currently active sub-tab ID */
  activeTabId: string;
  /** Callback when any tab is changed */
  onChange: (tabId: string) => void;
  /** Optional CSS class */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show sub-tabs in compact mode */
  compactSubTabs?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TabsV2: React.FC<TabsV2Props> = ({
  tabs,
  activeTabId,
  onChange,
  className = '',
  size = 'md',
  compactSubTabs = false,
}) => {
  const { theme } = useTheme();
  const parentTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const subTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Find active parent tab based on active sub-tab
  const activeParentTab = tabs.find(parent =>
    parent.subTabs.some(sub => sub.id === activeTabId)
  ) || tabs[0];

  // Handle parent tab change - switch to first sub-tab of that parent
  const handleParentTabChange = (parentId: string) => {
    const parent = tabs.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0 && !parent.disabled) {
      const firstEnabledSubTab = parent.subTabs.find(sub => !sub.disabled);
      if (firstEnabledSubTab) {
        onChange(firstEnabledSubTab.id);
      }
    }
  };

  // Keyboard navigation for parent tabs
  const handleParentKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === tabs[index]!.id);

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % enabledTabs.length;
      const nextTab = enabledTabs[nextIndex];
      if (!nextTab) return;
      handleParentTabChange(nextTab.id);
      const actualIndex = tabs.findIndex(t => t.id === nextTab.id);
      parentTabRefs.current[actualIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      const prevTab = enabledTabs[prevIndex];
      if (!prevTab) return;
      handleParentTabChange(prevTab.id);
      const actualIndex = tabs.findIndex(t => t.id === prevTab.id);
      parentTabRefs.current[actualIndex]?.focus();
    }
  };

  // Keyboard navigation for sub-tabs
  const handleSubKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!activeParentTab) return;

    const enabledSubTabs = activeParentTab.subTabs.filter(t => !t.disabled);
    const currentIndex = enabledSubTabs.findIndex(t => t.id === activeParentTab.subTabs[index]!.id);

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % enabledSubTabs.length;
      const nextTab = enabledSubTabs[nextIndex];
      if (!nextTab) return;
      onChange(nextTab.id);
      const actualIndex = activeParentTab.subTabs.findIndex(t => t.id === nextTab.id);
      subTabRefs.current[actualIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + enabledSubTabs.length) % enabledSubTabs.length;
      const prevTab = enabledSubTabs[prevIndex];
      if (!prevTab) return;
      onChange(prevTab.id);
      const actualIndex = activeParentTab.subTabs.findIndex(t => t.id === prevTab.id);
      subTabRefs.current[actualIndex]?.focus();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      parent: 'text-xs pb-2 px-1',
      parentIcon: 'h-3 w-3 mr-1.5',
      sub: 'px-2.5 py-1 text-xs',
      subIcon: 'h-3 w-3',
    },
    md: {
      parent: 'text-sm pb-3 px-1',
      parentIcon: 'h-4 w-4 mr-2',
      sub: 'px-3 py-1.5 text-sm',
      subIcon: 'h-3.5 w-3.5',
    },
    lg: {
      parent: 'text-base pb-4 px-2',
      parentIcon: 'h-5 w-5 mr-2',
      sub: 'px-4 py-2 text-base',
      subIcon: 'h-4 w-4',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('w-full', className)}>
      {/* Parent Tabs - Underline Style */}
      <div className={cn('flex space-x-4 md:space-x-6 border-b overflow-x-auto no-scrollbar', theme.border.default)}>
        {tabs.map((parent, index) => {
          const Icon = parent.icon;
          const isActive = activeParentTab?.id === parent.id;
          const isDisabled = parent.disabled;

          return (
            <button
              key={parent.id}
              ref={el => { if (el) parentTabRefs.current[index] = el; }}
              onClick={() => !isDisabled && handleParentTabChange(parent.id)}
              onKeyDown={(e) => !isDisabled && handleParentKeyDown(e, index)}
              disabled={isDisabled}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              className={cn(
                'flex items-center font-medium transition-all border-b-2 whitespace-nowrap',
                sizes.parent,
                isDisabled
                  ? cn('opacity-40 cursor-not-allowed', theme.text.tertiary)
                  : isActive
                    ? cn('border-current', theme.primary.text)
                    : cn('border-transparent', theme.text.secondary, `hover:${theme.text.primary}`, 'hover:border-slate-300')
              )}
            >
              <Icon className={cn(
                sizes.parentIcon,
                isActive ? theme.primary.text : theme.text.tertiary
              )} />
              {parent.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tabs - Pill/Badge Style */}
      {activeParentTab && activeParentTab.subTabs.length > 0 && (
        <div
          className={cn(
            'flex space-x-2 overflow-x-auto no-scrollbar touch-pan-x mt-3',
            compactSubTabs ? 'py-2 px-3' : 'py-3 px-4 md:px-6 rounded-lg border',
            !compactSubTabs && cn(theme.surface.highlight, theme.border.default)
          )}
        >
          {activeParentTab.subTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            const isDisabled = tab.disabled;

            return (
              <button
                key={tab.id}
                ref={el => { if (el) subTabRefs.current[index] = el; }}
                onClick={() => !isDisabled && onChange(tab.id)}
                onKeyDown={(e) => !isDisabled && handleSubKeyDown(e, index)}
                disabled={isDisabled}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                className={cn(
                  'flex-shrink-0 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 border',
                  sizes.sub,
                  isDisabled
                    ? cn('opacity-40 cursor-not-allowed', theme.text.tertiary)
                    : isActive
                      ? cn(theme.surface.default, theme.primary.text, 'shadow-sm border-transparent ring-1', theme.primary.border)
                      : cn('bg-transparent', theme.text.secondary, 'border-transparent', `hover:${theme.surface.default}`)
                )}
              >
                {Icon && <Icon className={cn(sizes.subIcon, isActive ? theme.primary.text : theme.text.tertiary)} />}
                {tab.label}
                {tab.badge && (
                  <span className={cn(
                    'ml-1 px-1.5 py-0.5 rounded-full text-xs',
                    isActive
                      ? cn(theme.primary.DEFAULT, 'text-white')
                      : cn(theme.surface.default, theme.text.tertiary)
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

TabsV2.displayName = 'TabsV2';
