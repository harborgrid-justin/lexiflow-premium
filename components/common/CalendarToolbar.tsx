
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface CalendarToolbarProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  view?: 'month' | 'list';
  onViewChange?: (view: 'month' | 'list') => void;
  actions?: React.ReactNode;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  label,
  onPrev,
  onNext,
  onToday,
  view,
  onViewChange,
  actions
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <h2 className={cn("text-lg font-bold min-w-[140px]", theme.text.primary)}>{label}</h2>
        
        <div className={cn("flex items-center rounded-lg p-0.5 border", theme.surface.highlight, theme.border.default)}>
          <button 
            onClick={onPrev} 
            className={cn("p-1.5 rounded-md transition-all shadow-sm", theme.text.secondary, `hover:${theme.surface.default}`)}
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-4 w-4"/>
          </button>
          <button 
            onClick={onToday}
            className={cn("px-3 py-1 text-xs font-semibold", theme.text.secondary, `hover:${theme.text.primary}`)}
          >
            Today
          </button>
          <button 
            onClick={onNext} 
            className={cn("p-1.5 rounded-md transition-all shadow-sm", theme.text.secondary, `hover:${theme.surface.default}`)}
            aria-label="Next Month"
          >
            <ChevronRight className="h-4 w-4"/>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {onViewChange && (
          <div className={cn("flex rounded-lg p-0.5 border", theme.surface.highlight, theme.border.default)}>
            <button 
              onClick={() => onViewChange('month')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === 'month' ? cn(theme.surface.default, "shadow text-blue-600") : cn(theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <Grid className="h-4 w-4"/>
            </button>
            <button 
              onClick={() => onViewChange('list')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === 'list' ? cn(theme.surface.default, "shadow text-blue-600") : cn(theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <List className="h-4 w-4"/>
            </button>
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};
