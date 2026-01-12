/**
 * @module admin/data/DataPlatformSidebar
 * @category Admin Panel - Data Platform
 * @description Hierarchical navigation sidebar for data platform views with expandable menu sections,
 * active view highlighting, and cluster health monitoring. Manages schema, pipeline, cost, quality,
 * lineage, governance, and catalog navigation.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.default/highlight - Sidebar background and header sections
 * - theme.text.primary/secondary/tertiary - Menu labels and descriptions
 * - theme.border.default - Section dividers and nested menu borders
 * - theme.primary.light/text - Active view highlighting
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { ChevronDown, ChevronRight, Server } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Hooks & Context
import { useTheme } from '@/features/theme';

// Utils & Constants
import { cn } from '@/shared/lib/cn';
import { DATA_PLATFORM_MENU, type MenuItem } from '@config/tabs.config';

// Types
import type { PlatformView } from '@/features/admin/components/data/types';

// ========================================
// TYPES & INTERFACES
// ========================================
interface DataPlatformSidebarProps {
  activeView: PlatformView;
  onChange: (view: PlatformView) => void;
}

// ========================================
// COMPONENT
// ========================================
export const DataPlatformSidebar: React.FC<DataPlatformSidebarProps> = ({ activeView, onChange }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'schema': true,
    'pipeline': true,
    'cost': true,
    'quality': true,
    'lineage': true,
    'governance': true,
    'catalog': true
  });

  const menu: MenuItem[] = useMemo(() => DATA_PLATFORM_MENU, []);

  // Auto-expand parent if child is active
  useEffect(() => {
    const parent = menu.find(item => item.children?.some(c => c.id === activeView));
    if (parent && !expanded[parent.id]) {
      setExpanded(prev => ({ ...prev, [parent.id]: true }));
    }
  }, [activeView, menu, expanded]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={cn("w-full h-full flex flex-col shrink-0", theme.surface.default)}>
      <div className={cn("p-4 border-b shrink-0", theme.border.default, theme.surface.highlight)}>
        <h3 className={cn("font-bold text-xs uppercase tracking-wider", theme.text.secondary)}>Data Platform</h3>
        <p className={cn("text-xs mt-1 font-mono flex items-center gap-1", theme.text.tertiary)}>
          <Server className="h-3 w-3" /> v2.5 Enterprise
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
        {menu.map((item: MenuItem) => {
          const hasChildren = item.children && item.children.length > 0;
          const itemId = item.id as string;
          const isExpanded = expanded[itemId];
          const isActive = activeView === itemId || (activeView.startsWith(itemId + '-'));

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasChildren) toggleExpand(itemId);
                  else onChange(itemId as PlatformView);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group",
                  isActive
                    ? cn(theme.primary.light, theme.primary.text)
                    : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
                )}
              >
                <div className="flex items-center">
                  <item.icon className={cn("h-4 w-4 mr-3", isActive ? theme.primary.text : cn(theme.text.tertiary, `group-hover:${theme.text.secondary}`))} />
                  {item.label}
                </div>
                {hasChildren && (
                  <div className={theme.text.tertiary}>
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </div>
                )}
              </button>

              {hasChildren && isExpanded && item.children && (
                <div className={cn("ml-4 pl-3 border-l space-y-1 mt-1 mb-1", theme.border.default)}>
                  {item.children.map((sub: MenuItem) => (
                    <button
                      key={sub.id}
                      onClick={() => onChange(sub.id as PlatformView)}
                      className={cn(
                        "w-full flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        activeView === sub.id
                          ? cn(theme.primary.light, theme.primary.text)
                          : cn(theme.text.secondary, `hover:${theme.text.primary}`, `hover:${theme.surface.highlight}`)
                      )}
                    >
                      <sub.icon className={cn("h-3 w-3 mr-2", activeView === sub.id ? "opacity-100" : "opacity-70")} />
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className={cn("p-4 border-t shrink-0", theme.border.default, theme.surface.highlight)}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className={cn("text-xs font-mono", theme.text.secondary)}>Cluster Healthy</span>
        </div>
        <div className={cn("w-full rounded-full h-1.5", theme.border.default, "bg-slate-200 dark:bg-slate-700")}>
          <div className={cn("h-1.5 rounded-full", theme.primary.DEFAULT)} style={{ width: '42%' }}></div>
        </div>
        <div className={cn("flex justify-between text-[9px] mt-1", theme.text.tertiary)}>
          <span>CPU: 42%</span>
          <span>MEM: 12GB</span>
        </div>
      </div>
    </div>
  );
};
