
import React from 'react';
import { useWindow } from '../../context/WindowContext';
import { Maximize2, X, Minimize2, Layers } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const HolographicDock: React.FC = () => {
  const { windows, restoreWindow, closeWindow } = useWindow();
  const { theme } = useTheme();
  
  const minimizedWindows = windows.filter(w => w.isMinimized && w.isOpen);

  if (minimizedWindows.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3 items-end pointer-events-none">
      {minimizedWindows.map((win) => (
        <div 
          key={win.id}
          className={cn(
            "pointer-events-auto w-72 backdrop-blur-xl border shadow-2xl rounded-xl overflow-hidden transform transition-all duration-300 translate-y-0 opacity-100 cursor-pointer flex items-center justify-between p-4 group animate-in slide-in-from-right-10",
            "hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
            theme.surface,
            "bg-opacity-90",
            "border-opacity-40",
            theme.border.default
          )}
          onClick={() => restoreWindow(win.id)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-inner shrink-0">
                <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className={cn("text-xs font-bold truncate select-none max-w-[140px]", theme.text.primary)}>{win.title}</span>
                <span className={cn("text-[10px] font-medium", theme.text.secondary)}>Workspace Minimized</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
                onClick={(e) => { e.stopPropagation(); restoreWindow(win.id); }} 
                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                title="Restore"
             >
                <Maximize2 className="h-4 w-4"/>
             </button>
             <button 
                onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} 
                className="p-1.5 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                title="Close"
             >
                <X className="h-4 w-4"/>
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};
