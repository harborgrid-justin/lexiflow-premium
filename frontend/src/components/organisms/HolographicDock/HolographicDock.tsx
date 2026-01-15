/**
 * @module components/layout/HolographicDock
 * @category Layout
 * @description Dock for minimized holographic windows.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import { Maximize2, X, Layers } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';
import { useWindow } from '@/providers';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HolographicDock - React 18 optimized with React.memo and useMemo
 */
export const HolographicDock = React.memo(() => {
  const { windows, restoreWindow, closeWindow } = useWindow();
  const { theme } = useTheme();
  
  const minimizedWindows = useMemo(
    () => windows.filter(w => w.isMinimized && w.isOpen),
    [windows]
  );

  if (minimizedWindows.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3 items-end pointer-events-none">
      {minimizedWindows.map((win) => (
        <div 
          key={win.id}
          className={cn(
            "pointer-events-auto w-72 backdrop-blur-xl border shadow-2xl rounded-xl overflow-hidden transform transition-all duration-300 translate-y-0 opacity-100 cursor-pointer flex items-center justify-between p-4 group animate-in slide-in-from-right-10",
            "hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
            theme.surface.default,
            "bg-opacity-90 dark:bg-opacity-90", // Enforce opacity on top of theme surface
            theme.border.default
          )}
          onClick={() => restoreWindow(win.id)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-inner shrink-0", theme.primary.DEFAULT)}>
                <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className={cn("text-xs font-bold truncate select-none max-w-[140px]", theme.text.primary)}>{win.title}</span>
                <span className={cn("text-[10px] font-medium", theme.text.secondary)}>Workspace Minimized</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); restoreWindow(win.id); }} 
                className={cn("p-1.5 rounded-full transition-colors", theme.primary.light, theme.primary.text)}
                title="Restore"
             >
                <Maximize2 className="h-4 w-4"/>
             </button>
             <button 
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); closeWindow(win.id); }} 
                className={cn("p-1.5 rounded-full transition-colors", theme.action.danger.hover, theme.status.error.text)}
                title="Close"
             >
                <X className="h-4 w-4"/>
             </button>
          </div>
        </div>
      ))}
    </div>
  );
});
