
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface FilterPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  onClear?: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onClear, children, title = "Filters", className = "" }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={cn(
      "border rounded-lg p-4 animate-in slide-in-from-top-2 mb-4 shadow-sm",
      theme.surface,
      theme.border.default,
      className
    )}>
      <div className={cn("flex justify-between items-center mb-4 border-b pb-2", theme.border.light)}>
        <h4 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>{title}</h4>
        <div className="flex items-center gap-3">
          {onClear && (
            <button 
              onClick={onClear} 
              className={cn("text-xs hover:underline font-medium", theme.primary.text)}
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className={cn("transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`)}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
};
