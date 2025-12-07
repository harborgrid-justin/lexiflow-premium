// components/Sidebar.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { Scale, X, ChevronDown, LogOut, Settings, User as UserIcon, Layers, Monitor } from 'lucide-react';
import { User as UserType, AppView, NavCategory, ModuleDefinition } from '../types';
import { ModuleRegistry } from '../services/moduleRegistry';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useWindow } from '../context/WindowContext';
import { queryClient } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { STORES } from '../services/db';
import { PATHS } from '../constants/paths';
import { useHoverIntent } from '../hooks/useHoverIntent';
import { UserAvatar } from './common/UserAvatar';
import { PREFETCH_MAP } from '../config/prefetchConfig';

// Data Prefetch Map: Maps routes to their data dependencies
// This was moved to config/prefetchConfig.ts in a previous turn, but was still in this file,
// so it's being removed here and will be correctly imported from the config file.


interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onSwitchUser: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose, currentUser, onSwitchUser }) => {
  const { theme } = useTheme();
  const { isOrbitalEnabled, toggleOrbitalMode } = useWindow();
  const [modules, setModules] = useState<ModuleDefinition[]>([]);

  // Subscribe to registry changes
  useEffect(() => {
    setModules(ModuleRegistry.getAllModules());
    const unsubscribe = ModuleRegistry.subscribe(() => {
        setModules(ModuleRegistry.getAllModules());
    });
    return () => { unsubscribe(); };
  }, []);

  const visibleItems = useMemo(() => {
    const isAuthorizedAdmin = currentUser.role === 'Administrator' || currentUser.role === 'Senior Partner';
    return modules.filter(item => {
      if (item.requiresAdmin && !isAuthorizedAdmin) return false;
      return true;
    });
  }, [currentUser.role, modules]);

  const groupedItems = useMemo(() => {
    const groups: Partial<Record<NavCategory, ModuleDefinition[]>> = {};
    const categoryOrder: NavCategory[] = ['Main', 'Case Work', 'Litigation Tools', 'Operations', 'Knowledge', 'Admin'];
    
    categoryOrder.forEach(cat => {
        groups[cat] = [];
    });

    visibleItems.forEach(item => {
        if (groups[item.category]) {
            groups[item.category]!.push(item);
        }
    });

    return groups;
  }, [visibleItems]);
  
  const { hoverHandlers } = useHoverIntent({
      onHover: (item: ModuleDefinition) => {
          // 1. Code Splitting Prefetch
          const component = item.component as any;
          if (component && component.preload) {
              component.preload();
          }
          // 2. Data Prefetching
          const prefetchConfig = PREFETCH_MAP[item.id];
          if (prefetchConfig) {
              queryClient.fetch(prefetchConfig.key, prefetchConfig.fn);
          }
      },
      timeout: 200 // Only prefetch if user hovers for 200ms
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className={cn("fixed inset-0 backdrop-blur-sm z-40 md:hidden transition-opacity", theme.backdrop)}
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col h-full border-r transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none touch-pan-y",
        theme.surface.default,
        theme.border.default,
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static md:inset-auto'
      )}>
        {/* Brand Header */}
        <div className={cn("h-16 flex items-center justify-between px-6 border-b shrink-0", theme.surface.default, theme.border.default)}>
          <div className="flex items-center space-x-3">
            <div className={cn("p-1.5 rounded-lg shadow-sm border", theme.primary.DEFAULT, theme.primary.border)}>
                <Scale className={cn("h-5 w-5 text-white")} />
            </div>
            <div>
              <h1 className={cn("text-lg font-bold tracking-tight leading-none", theme.text.primary)}>LexiFlow</h1>
              <p className={cn("text-[10px] uppercase tracking-widest font-bold mt-0.5 opacity-60", theme.text.primary)}>Enterprise Suite</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={cn("md:hidden p-1.5 rounded-md transition-colors", theme.text.tertiary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Content */}
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
                                        {...hoverHandlers(item)} // Smart Prefetching
                                        className={cn(
                                            "w-full flex items-center space-x-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                            isActive 
                                                ? cn("bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300") 
                                                : cn(theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)
                                        )}
                                    >
                                        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "opacity-70 group-hover:opacity-100 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
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

        {/* User Footer */}
        <div className={cn("p-4 border-t shrink-0 bg-slate-50/50", theme.border.default)}>
          {/* Interface Toggle */}
          <div className="mb-4 flex items-center justify-between px-1">
              <span className={cn("text-xs font-bold text-slate-400 uppercase tracking-wide")}>Holographic Mode</span>
              <button 
                onClick={toggleOrbitalMode}
                className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                    isOrbitalEnabled ? "bg-blue-600" : "bg-slate-300"
                )}
                title={isOrbitalEnabled ? "Windowed Interface" : "Flat Interface"}
              >
                <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", isOrbitalEnabled ? "translate-x-4" : "translate-x-0")} />
              </button>
          </div>

          <button 
            onClick={onSwitchUser}
            className={cn(
                "w-full flex items-center p-2 rounded-lg transition-colors group mb-3 border shadow-sm",
                theme.surface.default,
                theme.border.default,
                `hover:${theme.surface.highlight}`
            )}
          >
            <div className="relative">
                <UserAvatar name={currentUser.name} size="sm" className="mr-3" />
                <span className="absolute -bottom-0.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className={cn("text-xs font-bold truncate", theme.text.primary)}>
                {currentUser.name}
              </p>
              <p className={cn("text-[10px] truncate font-medium", theme.text.secondary)}>
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className={cn("h-4 w-4 opacity-50", theme.text.tertiary)} />
          </button>
          
          <div className="grid grid-cols-2 gap-2">
             <button className={cn("h-8 px-2 text-xs font-medium rounded transition-colors flex items-center justify-center border", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.text.primary} hover:${theme.surface.highlight}`)}>
                <Settings className="h-3.5 w-3.5 mr-1.5"/> Settings
             </button>
             <button className={cn("h-8 px-2 text-xs font-medium rounded transition-colors flex items-center justify-center border", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.text.primary} hover:${theme.surface.highlight}`)}>
                <LogOut className="h-3.5 w-3.5 mr-1.5"/> Sign Out
             </button>
          </div>
        </div>
      </div>
    </>
  );
};