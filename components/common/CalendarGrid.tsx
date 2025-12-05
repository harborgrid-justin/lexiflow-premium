
import React, { useMemo } from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface CalendarGridProps {
  currentDate: Date;
  renderCell: (date: Date) => React.ReactNode;
  onDateClick?: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  renderCell,
  onDateClick
}) => {
  const { theme, mode } = useTheme();
  
  const { daysArray, paddingDays, month, year, daysInMonth, startDayOfWeek } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDayOfMonth = new Date(y, m, 1);
    const dInMonth = new Date(y, m + 1, 0).getDate();
    const sDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    
    return {
        year: y,
        month: m,
        daysInMonth: dInMonth,
        startDayOfWeek: sDayOfWeek,
        daysArray: Array.from({ length: dInMonth }, (_, i) => i + 1),
        paddingDays: Array.from({ length: sDayOfWeek }, (_, i) => i)
    };
  }, [currentDate]);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const gridBg = mode === 'dark' ? 'bg-slate-800' : 'bg-slate-200';

  return (
    <div className={cn("flex flex-col h-full rounded-lg border shadow-sm overflow-hidden", theme.surface, theme.border.default)}>
      {/* Day Headers */}
      <div className={cn("grid grid-cols-7 border-b", theme.surfaceHighlight, theme.border.default)}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className={cn("py-2 text-center text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className={cn("flex-1 grid grid-cols-7 auto-rows-fr gap-px", theme.border.default, gridBg)}>
        {/* Previous Month Padding */}
        {paddingDays.map((_, i) => (
          <div key={`padding-${i}`} className={cn("min-h-[120px] opacity-50", theme.surfaceHighlight)} />
        ))}

        {/* Days */}
        {daysArray.map((day) => {
          const dateObj = new Date(year, month, day);
          const today = isToday(day);
          
          return (
            <div 
              key={day} 
              onClick={() => onDateClick?.(dateObj)}
              className={cn(
                "p-2 min-h-[120px] flex flex-col transition-colors group relative",
                theme.surface,
                `hover:${theme.surfaceHighlight}`,
                today ? cn(theme.primary.light, "bg-opacity-30") : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  today ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow-md") : theme.text.primary
                )}>
                  {day}
                </span>
                
                {/* Add button placeholder - visible on hover */}
                <button className={cn("opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity", theme.surfaceHighlight, theme.text.tertiary)}>
                  <span className="sr-only">Add Event</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {renderCell(dateObj)}
              </div>
            </div>
          );
        })}

        {/* Next Month Padding to fill grid if needed */}
        {Array.from({ length: (42 - (daysInMonth + startDayOfWeek)) % 7 }).map((_, i) => (
           <div key={`end-padding-${i}`} className={cn("min-h-[120px] opacity-50", theme.surfaceHighlight)} />
        ))}
      </div>
    </div>
  );
};