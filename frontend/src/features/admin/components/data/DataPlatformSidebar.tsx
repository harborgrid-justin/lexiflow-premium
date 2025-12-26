
import React, { useState, useEffect, useMemo } from 'react';
import { Server, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { PlatformView } from './types';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DATA_PLATFORM_MENU, MenuItem } from '@/config/tabs.config';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { TenantConfig } from '@/types';

interface DataPlatformSidebarProps {
  activeView: PlatformView;
  onChange: (view: PlatformView) => void;
}

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

  const { data: tenantConfig } = useQuery<TenantConfig>(
      ['admin', 'tenant'],
      DataService.admin.getTenantConfig,
      { initialData: { name: 'LexiFlow', tier: 'Enterprise Suite', version: '2.5', region: 'US-East-1' } }
  );

  const menu: MenuItem[] = useMemo(() => DATA_PLATFORM_MENU, []);

  // Auto-expand parent if child is active
  useEffect(() => {
    const parent = menu.find(item => item.children?.some(c => c.id === activeView));
    if (parent && !expanded[parent.id]) {
      setExpanded(prev => ({ ...prev, [parent.id]: true }));
    }
  }, [activeView, menu]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={cn("w-full h-full flex flex-col shrink-0", theme.surface.default)}>
      <div className={cn("p-4 border-b shrink-0", theme.border.default, theme.surface.highlight)}>
        <h3 className={cn("font-bold text-xs uppercase tracking-wider", theme.text.secondary)}>Data Platform</h3>
        <p className={cn("text-xs mt-1 font-mono flex items-center gap-1", theme.text.tertiary)}>
          <Server className="h-3 w-3"/> v{tenantConfig?.version} {tenantConfig?.tier}
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
        {menu.map(item => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expanded[item.id];
          const isActive = activeView === item.id || (activeView.startsWith(item.id + '-'));

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    // Navigate to first child
                    if (item.children && item.children.length > 0) {
                      onChange(item.children[0].id);
                    }
                    // Also expand if not already expanded
                    if (!isExpanded) {
                      toggleExpand(item.id);
                    }
                  } else {
                    onChange(item.id);
                  }
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
                  <div 
                    className={cn(theme.text.tertiary, "hover:text-current transition-colors")}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toggleExpand(item.id);
                    }}
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3"/> : <ChevronRight className="h-3 w-3"/>}
                  </div>
                )}
              </button>
              
              {hasChildren && isExpanded && item.children && (
                <div className={cn("ml-4 pl-3 border-l space-y-1 mt-1 mb-1", theme.border.default)}>
                  {(item.children as any).map((sub: any) => (
                    <button
                      key={sub.id}
                      onClick={() => onChange(sub.id)}
                      className={cn(
                        "w-full flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        activeView === sub.id
                          ? cn(theme.primary.light, theme.primary.text)
                          : cn(theme.text.secondary, `hover:${theme.text.primary}`, `hover:${theme.surface.highlight}`)
                      )}
                    >
                      <sub.icon className={cn("h-3 w-3 mr-2", activeView === sub.id ? "opacity-100" : "opacity-70")}/>
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
