
import React from 'react';
import { Menu, ZoomIn, ZoomOut } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface BuilderToolbarProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  onToggleSidebar: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  scale, setScale, onToggleSidebar
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("h-12 border-b px-4 flex justify-between items-center z-20 shrink-0 shadow-sm", theme.surface.default, theme.border.default)}>
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className={cn("p-2 rounded-md", `hover:${theme.surfaceHighlight}`)}>
          <Menu className={cn("h-5 w-5", theme.text.secondary)} />
        </button>
        <span className={cn("text-xs font-bold uppercase tracking-wider", theme.text.tertiary)}>Visual Designer</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn("flex rounded-lg p-1 mr-2 border", theme.surfaceHighlight, theme.border.default)}>
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.default}`)}><ZoomOut className="h-4 w-4"/></button>
          <span className={cn("px-2 text-xs flex items-center font-mono w-12 justify-center", theme.text.secondary)}>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.default}`)}><ZoomIn className="h-4 w-4"/></button>
        </div>
      </div>
    </div>
  );
};
