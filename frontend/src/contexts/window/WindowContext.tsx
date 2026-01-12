import { ErrorBoundary } from "@/shared/ui/organisms/ErrorBoundary";
import { cn } from '@/shared/lib/cn';
import { WINDOW_MAX_INSTANCES, WINDOW_BASE_Z_INDEX, WINDOW_DEFAULT_WIDTH, WINDOW_DEFAULT_HEIGHT } from '@/config/features/contexts.config';
import { Maximize2, Minus, X } from 'lucide-react';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  DragState,
  WindowActionsValue,
  WindowInstance,
  WindowProviderProps,
  WindowStateValue,
} from './WindowContext.types';

/**
 * WindowContext - Application-level window management (orbital mode)
 *
 * Best Practices Applied:
 * - BP1: Cross-cutting concern (window management) justifies context usage
 * - BP2: Narrow interface with minimal surface area
 * - BP3: Split read/write contexts for performance
 * - BP4: No raw context export; only hooks
 * - BP6: Avoid high-frequency state (drag handled via ref, not state)
 * - BP7: Explicit memoization of provider values
 * - BP9: Co-locate provider and type definitions
 * - BP10: Stabilize function references
 * - BP11: Strict TypeScript contracts
 */

// Re-export types for convenience
export type { WindowInstance } from './WindowContext.types';

// BP3: Split contexts for state and actions
const WindowStateContext = createContext<WindowStateValue | undefined>(undefined);
const WindowActionsContext = createContext<WindowActionsValue | undefined>(undefined);

// BP4: Export only custom hooks, not raw contexts
export function useWindowState(): WindowStateValue {
  const context = useContext(WindowStateContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error('useWindowState must be used within a WindowProvider');
  }
  return context;
}

export function useWindowActions(): WindowActionsValue {
  const context = useContext(WindowActionsContext);
  // BP5: Fail fast when provider is missing
  if (!context) {
    throw new Error('useWindowActions must be used within a WindowProvider');
  }
  return context;
}

// Convenience hook for consumers that need both (backward compatibility)
export function useWindow() {
  return {
    ...useWindowState(),
    ...useWindowActions(),
  };
}

/**
 * WindowProvider
 *
 * BP13: Responsibilities:
 * - Manage window instances (open, close, minimize, restore)
 * - Handle window dragging (via refs to avoid high-frequency re-renders)
 * - Z-index management for window stacking
 * - Orbital mode toggle (dockable windows vs full-screen modals)
 *
 * Lifecycle:
 * - Creates portal root for windows on mount
 * - Attaches global mouse handlers for drag operations
 * - Cleans up event listeners on unmount
 */
export const WindowProvider = ({
  children,
  initialOrbitalMode,
  maxWindows = WINDOW_MAX_INSTANCES,
  theme: themeProp
}: WindowProviderProps) => {
  // Use theme from props or fallback to basic classes
  const theme = themeProp || {
    surface: { default: 'bg-white dark:bg-slate-800', muted: 'bg-slate-100 dark:bg-slate-700' },
    border: { default: 'border-slate-200 dark:border-slate-600' },
    accent: { primary: 'bg-blue-500' },
    text: { secondary: 'text-slate-700 dark:text-slate-300', tertiary: 'text-slate-500 dark:text-slate-400' },
    interactive: { hover: 'hover:bg-slate-200 dark:hover:bg-slate-600' }
  };
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(WINDOW_BASE_Z_INDEX);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // Settings State
  const [isOrbitalEnabled, setIsOrbitalEnabled] = useState(() => {
    if (initialOrbitalMode !== undefined) return initialOrbitalMode;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexiflow_orbital_mode') !== 'false';
    }
    return true;
  });

  // BP10: Stabilize function references with useCallback
  const toggleOrbitalMode = useCallback(() => {
    setIsOrbitalEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('lexiflow_orbital_mode', String(newVal));
      return newVal;
    });
  }, []);

  // BP6: Drag State handled via ref to avoid high-frequency re-renders
  const dragRef = useRef<DragState>({
    id: null, startX: 0, startY: 0, initialX: 0, initialY: 0
  });

  useEffect(() => {
    // BP13: Lifecycle - create portal root and attach mouse handlers
    let root = document.getElementById('window-layer');
    if (!root) {
      root = document.createElement('div');
      root.id = 'window-layer';
      document.body.appendChild(root);
    }
    setPortalRoot(root);

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.id) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      setWindows(prev => prev.map(w => {
        if (w.id === dragRef.current.id) {
          const newX = dragRef.current.initialX + dx;
          const newY = dragRef.current.initialY + dy;

          // Allow header to stay visible
          const boundedY = Math.max(0, Math.min(window.innerHeight - 40, newY));
          const boundedX = Math.max(-w.size.width + 100, Math.min(window.innerWidth - 100, newX));

          return {
            ...w,
            position: { x: boundedX, y: boundedY }
          };
        }
        return w;
      }));
    };

    const handleMouseUp = () => {
      if (dragRef.current.id) {
        dragRef.current.id = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // BP10: Stabilize function references with useCallback
  const bringToFront = useCallback((id: string) => {
    setMaxZIndex(prev => prev + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w));
  }, [maxZIndex]);

  // BP10: Stabilize function references with useCallback
  const openWindow = useCallback((id: string, title: string, component: ReactNode) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        return prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZIndex + 1 } : w);
      }

      // Safety check: if we've reached max windows, close the oldest one
      let windowsList = prev;
      if (prev.length >= maxWindows) {
        // Find oldest window (lowest zIndex among open windows)
        const openWindows = prev.filter(w => w.isOpen);
        if (openWindows.length >= maxWindows) {
          const oldestWindow = openWindows.reduce((oldest, current) =>
            current.zIndex < oldest.zIndex ? current : oldest
          );
          console.warn(`[WindowContext] Maximum window limit (${maxWindows}) reached. Closing oldest window: ${oldestWindow.title}`);
          windowsList = prev.filter(w => w.id !== oldestWindow.id);
        }
      }

      const width = 900;
      const height = 600;
      // Stagger new windows
      const offset = (windowsList.length % 10) * 30;
      const x = typeof window !== 'undefined' ? (window.innerWidth - width) / 2 + offset : 0;
      const y = typeof window !== 'undefined' ? (window.innerHeight - height) / 2 + offset : 0;

      return [...windowsList, {
        id,
        title,
        component,
        isMinimized: false,
        isOpen: true,
        zIndex: maxZIndex + 1,
        position: { x: Math.max(0, x), y: Math.max(0, y) },
        size: { width, height }
      }];
    });
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex, maxWindows]);

  // BP10: Stabilize function references with useCallback
  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  // BP10: Stabilize function references with useCallback
  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

  // BP10: Stabilize function references with useCallback
  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w));
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

  const handleDragStart = (e: React.MouseEvent, id: string, x: number, y: number) => {
    if (!isOrbitalEnabled) return;
    e.preventDefault();
    bringToFront(id);
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: x,
      initialY: y
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  // BP7: Memoize provider values explicitly - state context
  const stateValue = useMemo<WindowStateValue>(() => ({
    windows,
    currentMaxZIndex: maxZIndex,
    isOrbitalEnabled
  }), [windows, maxZIndex, isOrbitalEnabled]);

  // BP7: Memoize provider values explicitly - actions context
  const actionsValue = useMemo<WindowActionsValue>(() => ({
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleOrbitalMode
  }), [openWindow, closeWindow, minimizeWindow, restoreWindow, toggleOrbitalMode]);

  // BP3 & BP8: Multiple providers for split read/write
  return (
    <WindowStateContext.Provider value={stateValue}>
      <WindowActionsContext.Provider value={actionsValue}>
        {children}

        {portalRoot && windows.map(win => (
          win.isOpen && !win.isMinimized && createPortal(
            <div
              key={win.id}
              className={cn(
                "fixed overflow-hidden flex flex-col shadow-2xl transition-all duration-200 ease-out",
                theme.surface.default,
                theme.border.default,
                isOrbitalEnabled
                  ? "rounded-lg border"
                  : "inset-4 md:inset-8 rounded-xl border ring-1 ring-black/5 animate-in zoom-in-95"
              )}
              style={isOrbitalEnabled ? {
                zIndex: win.zIndex,
                width: `${win.size.width}px`,
                height: '80vh',
                top: win.position.y,
                left: win.position.x,
                maxWidth: '95vw',
                maxHeight: '95vh',
                contain: 'strict',
                contentVisibility: 'auto'
              } : {
                zIndex: win.zIndex + 2000,
                contain: 'strict'
              }}
              onMouseDown={() => bringToFront(win.id)}
            >
              {/* Window Header */}
              <div
                className={cn(
                  "h-10 border-b flex justify-between items-center px-3 shrink-0 select-none",
                  isOrbitalEnabled
                    ? cn(theme.surface.muted, "cursor-grab active:cursor-grabbing")
                    : theme.surface.default,
                  theme.border.default
                )}
                onMouseDown={(e) => handleDragStart(e, win.id, win.position.x, win.position.y)}
              >
                <div className="flex items-center gap-2">
                  {!isOrbitalEnabled && <div className={cn("w-1.5 h-4 rounded-full mr-1", theme.accent.primary)}></div>}
                  <span className={cn("text-xs font-bold", theme.text.secondary)}>{win.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isOrbitalEnabled && (
                    <button onClick={() => minimizeWindow(win.id)} className={cn("p-1 rounded", theme.interactive.hover, theme.text.tertiary)}>
                      <Minus className="h-3 w-3" />
                    </button>
                  )}
                  {isOrbitalEnabled && (
                    <button className={cn("p-1 rounded", theme.interactive.hover, theme.text.tertiary)}>
                      <Maximize2 className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => closeWindow(win.id)}
                    className={cn(
                      "p-1 rounded",
                      isOrbitalEnabled
                        ? "hover:bg-red-50 hover:text-red-500"
                        : cn(theme.surface.muted, theme.interactive.hover),
                      theme.text.tertiary
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {!isOrbitalEnabled && (
                <div className={cn("absolute inset-0 -z-10", theme.surface.default)}></div>
              )}

              {/* Content */}
              <div className="flex-1 h-full relative pointer-events-auto overflow-hidden">
                <ErrorBoundary scope={`Window-${win.id}`}>
                  {win.component}
                </ErrorBoundary>
              </div>
            </div>,
            portalRoot
          )
        ))}

        {!isOrbitalEnabled && windows.some(w => w.isOpen && !w.isMinimized) && portalRoot && createPortal(
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[1000] transition-opacity" />,
          portalRoot
        )}

      </WindowActionsContext.Provider>
    </WindowStateContext.Provider>
  );
};
