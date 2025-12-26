/**
 * @module components/sidebar/SidebarNav
 * @category Layout
 * @description Navigation menu for the sidebar with hover prefetching.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo, useEffect, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { ModuleRegistry } from '@/services/infrastructure/moduleRegistry';
import { queryClient } from '@/hooks/useQueryHooks';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useHoverIntent } from '@/hooks/useHoverIntent';

// Utils & Constants
import { cn } from '@/utils/cn';
import { PREFETCH_MAP } from '@/config/prefetchConfig';
import { Scheduler } from '@/utils/scheduler';
import * as styles from './SidebarNav.styles';

// Types
import type { NavCategory, ModuleDefinition } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SidebarNavProps {
  /** Currently active view path. */
  activeView: string;
  /** Callback to set the active view. */
  setActiveView: (view: string) => void;
  /** Current user's role for permission filtering. */
  currentUserRole: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeView, setActiveView, currentUserRole }) => {
  const { theme } = useTheme();
  const [modules, setModules] = useState<ModuleDefinition[]>([]);

  useEffect(() => {
    setModules(ModuleRegistry.getAllModules());
    const unsubscribe = ModuleRegistry.subscribe(() => setModules(ModuleRegistry.getAllModules()));
    return () => { unsubscribe(); };
  }, []);

  const visibleItems = useMemo(() => {
    const isAuthorizedAdmin = currentUserRole === 'Administrator' || currentUserRole === 'Senior Partner';
    return modules.filter(item => {
      // Filter out hidden routes (accessed via other pages, not directly in sidebar)
      if (item.hidden) return false;
      // Filter out admin-only routes for non-admin users
      if (item.requiresAdmin && !isAuthorizedAdmin) return false;
      return true;
    });
  }, [currentUserRole, modules]);

  const groupedItems = useMemo(() => {
    const groups: Partial<Record<NavCategory, ModuleDefinition[]>> = {};
    const categoryOrder: NavCategory[] = ['Main', 'Case Work', 'Litigation Tools', 'Operations', 'Knowledge', 'Admin'];
    categoryOrder.forEach(cat => { groups[cat] = []; });
    visibleItems.forEach(item => { if (groups[item.category]) groups[item.category]!.push(item); });
    return groups;
  }, [visibleItems]);

  const { hoverHandlers } = useHoverIntent({
    onHover: (item: ModuleDefinition) => {
      // PERFORMANCE CRITICAL: Use Scheduler to ensure pre-fetching never blocks the UI thread.
      // This prevents the "stutter" when moving the mouse quickly over multiple sidebar items.
      Scheduler.defer(() => {
        // 1. Preload Component Code (Lazy Load chunks)
        const component = item.component as any;
        if (component?.preload) component.preload();
        
        // 2. Preload Data (Heavy DB Ops)
        // We only prefetch if the data isn't already fresh in cache
        const prefetchConfig = PREFETCH_MAP[item.id];
        if (prefetchConfig) {
            // Using a longer stale time for hover-prefetches (2 mins) to avoid redundant DB hits
            queryClient.fetch(prefetchConfig.key as readonly (string | number | Record<string, unknown> | undefined)[], prefetchConfig.fn, 120000);
        }
      }, 'background');
    },
    timeout: 350, // Increased threshold: User must hover for 350ms before we burn CPU
  });

  return (
    <nav className={styles.navContainer}>
      {(Object.keys(groupedItems) as NavCategory[]).map(category => {
        const items = groupedItems[category];
        if (!items || items.length === 0) return null;

        return (
          <div key={category}>
            <h3 className={styles.getCategoryHeader(theme)}>
              {category}
            </h3>
            <div className={styles.itemsContainer}>
              {items.map(item => {
                if (!item.icon) return null;
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isChildActive = item.children?.some(child => child.id === activeView);
                
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setActiveView(item.id)}
                      {...hoverHandlers(item)}
                      className={styles.getNavItemButton(theme, isActive || isChildActive)}
                    >
                      <Icon className={styles.getNavItemIcon(isActive || isChildActive)} />
                      <span className={styles.navItemLabel}>{item.label}</span>
                      {(isActive || isChildActive) && <div className={styles.getActiveIndicator(theme)}></div>}
                    </button>
                    
                    {/* Submenu for children */}
                    {item.children && item.children.length > 0 && (isActive || isChildActive) && (
                      <div className={styles.getSubmenuContainer(theme)}>
                        {item.children.map(child => {
                          const ChildIcon = child.icon as React.ComponentType<{ className?: string }>;
                          const isChildItemActive = activeView === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => setActiveView(child.id)}
                              className={styles.getSubmenuButton(theme, isChildItemActive)}
                            >
                              {ChildIcon && <ChildIcon className={styles.getSubmenuIcon(isChildItemActive)} />}
                              <span className={styles.submenuLabel}>{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
};
