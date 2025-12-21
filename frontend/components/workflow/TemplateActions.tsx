
import React from 'react';
import { Copy, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const TemplateActions: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="relative group inline-block">
      <button 
        className={cn("p-2 rounded transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}
        aria-label="Template actions menu"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      <div className={cn("absolute right-0 top-full mt-1 w-32 border rounded-lg shadow-lg hidden group-hover:block z-20 py-1", theme.surface.default, theme.border.default)}>
        <button className={cn("w-full text-left px-3 py-2 text-xs flex items-center transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}>
          <Edit3 className="h-3 w-3 mr-2" /> Edit
        </button>
        <button className={cn("w-full text-left px-3 py-2 text-xs flex items-center transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}>
          <Copy className="h-3 w-3 mr-2" /> Clone
        </button>
        <div className={cn("border-t my-1", theme.border.default)}></div>
        <button className={cn("w-full text-left px-3 py-2 text-xs flex items-center transition-colors", theme.status.error.text, `hover:${theme.status.error.bg}`)}>
          <Trash2 className="h-3 w-3 mr-2" /> Delete
        </button>
      </div>
    </div>
  );
};
