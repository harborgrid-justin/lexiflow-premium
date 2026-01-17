/**
 * @module components/layouts/TabbedPageLayout
 * @category Layouts
 * @description Tabbed page layout with parent/child tab navigation.
 * Ideal for complex pages with multiple sections and subsections.
 *
 * THEME SYSTEM USAGE:
 * - theme.background - Page background
 * - theme.border.default - Border colors
 * - theme.primary.text - Active tab color
 * - theme.surface.highlight - Sub-tab background
 */

import React, { type ReactNode, useCallback, useMemo } from 'react';

import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { type TabConfigItem } from '@/types/layout';

export type { TabConfigItem };

interface TabbedPageLayoutProps {
  pageTitle: string;
  pageSubtitle: string;
  pageActions?: ReactNode;
  tabConfig: TabConfigItem[];
  children: ReactNode;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export const TabbedPageLayout = React.memo<TabbedPageLayoutProps>(({
  pageTitle,
  pageSubtitle,
  pageActions,
  tabConfig,
  children,
  activeTabId,
  onTabChange
}) => {
  const { theme } = useTheme();

  const activeParentTab = useMemo(() => {
    const found = tabConfig.find(p => p.subTabs?.some(s => s.id === activeTabId));
    return found || tabConfig[0] || { id: '', label: '', icon: () => null, subTabs: [] };
  }, [activeTabId, tabConfig]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = tabConfig.find(p => p.id === parentId);
    if (parent && parent.subTabs && parent.subTabs.length > 0) {
      const newTabId = parent.subTabs[0]?.id;
      if (newTabId) {
        onTabChange(newTabId);
      }
    }
  }, [tabConfig, onTabChange]);

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title={pageTitle}
          subtitle={pageSubtitle}
          actions={pageActions}
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
          {tabConfig.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab.id === parent.id
                  ? cn("border-current", theme.primary.text)
                  : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <parent.icon className="h-4 w-4 mr-2" style={{ color: activeParentTab.id === parent.id ? 'var(--color-primary)' : 'var(--color-textTertiary)' }} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs && activeParentTab.subTabs.length > 0 && (
          <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surface.highlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                  activeTabId === tab.id
                    ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border)
                    : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
                )}
              >
                <tab.icon className="h-3.5 w-3.5" style={{ color: activeTabId === tab.id ? 'var(--color-primary)' : 'var(--color-textTertiary)' }} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar touch-auto">
          {children}
        </div>
      </div>
    </div>
  );
});

TabbedPageLayout.displayName = 'TabbedPageLayout';
