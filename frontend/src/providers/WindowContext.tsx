
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Maximize2 } from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export interface WindowInstance {
  id: string;
  title: string;
  component: ReactNode;
  isMinimized: boolean;
  isOpen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number, height: number };
}

interface WindowContextType {
  windows: WindowInstance[];
  openWindow: (id: string, title: string, component: ReactNode) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  currentMaxZIndex: number;
  isOrbitalEnabled: boolean;
  toggleOrbitalMode: () => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

// Maximum number of windows to prevent memory leaks
const MAX_WINDOWS = 20;

export const useWindow = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
};

// Base Z-Index for Windows (below Modals and Toasts)
const BASE_WINDOW_Z = 1000;

export const WindowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(BASE_WINDOW_Z);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  
  // Settings State
  const [isOrbitalEnabled, setIsOrbitalEnabled] = useState(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('lexiflow_orbital_mode') !== 'false';
      }
      return true;
  });

  const toggleOrbitalMode = useCallback(() => {
      setIsOrbitalEnabled(prev => {
          const newVal = !prev;
          localStorage.setItem('lexiflow_orbital_mode', String(newVal));
          return newVal;
      });
  }, []);

  // Drag State
  const dragRef = useRef<{ id: string | null; startX: number; startY: number; initialX: number; initialY: number }>({
      id: null, startX: 0, startY: 0, initialX: 0, initialY: 0
  });

  useEffect(() => {
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

  const bringToFront = useCallback((id: string) => {
    setMaxZIndex(prev => prev + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w));
  }, [maxZIndex]);

  const openWindow = useCallback((id: string, title: string, component: ReactNode) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        return prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZIndex + 1 } : w);
      }

      // Safety check: if we've reached max windows, close the oldest one
      let windowsList = prev;
      if (prev.length >= MAX_WINDOWS) {
        // Find oldest window (lowest zIndex among open windows)
        const openWindows = prev.filter(w => w.isOpen);
        if (openWindows.length >= MAX_WINDOWS) {
          const oldestWindow = openWindows.reduce((oldest, current) =>
            current.zIndex < oldest.zIndex ? current : oldest
          );
          console.warn(`[WindowContext] Maximum window limit (${MAX_WINDOWS}) reached. Closing oldest window: ${oldestWindow.title}`);
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
  }, [maxZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

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

  const contextValue = useMemo(() => ({
    windows, 
    openWindow, 
    closeWindow, 
    minimizeWindow, 
    restoreWindow, 
    currentMaxZIndex: maxZIndex, 
    isOrbitalEnabled, 
    toggleOrbitalMode
  }), [windows, openWindow, closeWindow, minimizeWindow, restoreWindow, maxZIndex, isOrbitalEnabled, toggleOrbitalMode]);

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
      
      {portalRoot && windows.map(win => (
          win.isOpen && !win.isMinimized && createPortal(
            <div 
                key={win.id} 
                className={`fixed overflow-hidden bg-white dark:bg-slate-900 flex flex-col shadow-2xl transition-all duration-200 ease-out ${
                    isOrbitalEnabled 
                    ? "rounded-lg border border-slate-200 dark:border-slate-700" 
                    : "inset-4 md:inset-8 rounded-xl border border-slate-200 dark:border-slate-700 ring-1 ring-black/5 animate-in zoom-in-95" 
                }`}
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
                    className={`h-10 border-b flex justify-between items-center px-3 shrink-0 select-none ${
                        isOrbitalEnabled 
                        ? "bg-slate-50 dark:bg-slate-800 cursor-grab active:cursor-grabbing" : "bg-white dark:bg-slate-900"
                    } border-slate-200 dark:border-slate-700`}
                    onMouseDown={(e) => handleDragStart(e, win.id, win.position.x, win.position.y)}
                >
                    <div className="flex items-center gap-2">
                        {!isOrbitalEnabled && <div className="w-1.5 h-4 bg-blue-600 rounded-full mr-1"></div>}
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{win.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {isOrbitalEnabled && (
                            <button onClick={() => minimizeWindow(win.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400">
                                <Minus className="h-3 w-3"/>
                            </button>
                        )}
                         {isOrbitalEnabled && (
                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400">
                                <Maximize2 className="h-3 w-3"/>
                            </button>
                        )}
                        <button 
                            onClick={() => closeWindow(win.id)} 
                            className={`p-1 rounded ${isOrbitalEnabled ? "hover:bg-red-50 text-slate-400 hover:text-red-500" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"}`}
                        >
                            <X className="h-3 w-3"/>
                        </button>
                    </div>
                </div>
                
                {!isOrbitalEnabled && (
                    <div className="absolute inset-0 -z-10 bg-white dark:bg-slate-900"></div>
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
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-[1000] transition-opacity" />,
          portalRoot
      )}

    </WindowContext.Provider>
  );
};
