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
import { ModuleRegistry } from '../../services/moduleRegistry';
import { queryClient } from '../../services/queryClient';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useHoverIntent } from '../../hooks/useHoverIntent';

// Utils & Constants
import { cn } from '../../utils/cn';
import { PATHS } from '../../config/paths.config';
import { PREFETCH_MAP } from '../../config/prefetchConfig';
import { Scheduler } from '../../utils/scheduler';

// Types
import type { NavCategory, ModuleDefinition } from '../../types';

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
      if (item.id === PATHS.PROFILE) return false;
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
            queryClient.fetch(prefetchConfig.key, prefetchConfig.fn, 120000);
        }
      }, 'background');
    },
    timeout: 350, // Increased threshold: User must hover for 350ms before we burn CPU
  });

  return (
    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar touch-auto">
      {(Object.keys(groupedItems) as NavCategory[]).map(category => {
        const items = groupedItems[category];
        if (!items || items.length === 0) return null;

        return (
          <div key={category}>
            <h3 className={cn("px-3 text-[10px] font-bold uppercase tracking-wider mb-2", theme.text.tertiary)}>
              {category}
            </h3>
            <div className="space-y-0.5">
              {items.map(item => {
                if (!item.icon) return null;
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    {...hoverHandlers(item)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                      isActive 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                        : cn(theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "opacity-70 group-hover:opacity-100")} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full"></div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
};
