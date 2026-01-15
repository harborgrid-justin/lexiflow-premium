/**
 * @module components/common/CalendarGrid
 * @category Common
 * @description Monthly calendar grid with custom cell rendering.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CalendarGridProps {
  currentDate: Date;
  renderCell: (date: Date) => React.ReactNode;
  onDateClick?: (date: Date) => void;
}

/**
 * CalendarGrid - React 18 optimized with React.memo
 */
export const CalendarGrid = React.memo<CalendarGridProps>(({
  currentDate,
  renderCell,
  onDateClick
}) => {
  const { theme } = useTheme();

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

  return (
    <div className={cn("flex flex-col h-full rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Day Headers */}
      <div className={cn("grid grid-cols-7 border-b", theme.surface.highlight, theme.border.default)}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className={cn("py-2 text-center text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className={cn("flex-1 grid grid-cols-7 auto-rows-fr gap-px", theme.border.default, theme.surface.highlight)}>
        {/* Previous Month Padding */}
        {paddingDays.map((_, i) => (
          <div key={`padding-${i}`} className={cn("min-h-[120px] opacity-50", theme.surface.highlight)} />
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
                theme.surface.default,
                `hover:${theme.surface.highlight}`,
                today ? cn(theme.primary.light, "ring-1 ring-inset", theme.primary.border) : ""
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
                <button className={cn("opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity", theme.surface.highlight, theme.text.tertiary)}>
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
          <div key={`end-padding-${i}`} className={cn("min-h-[120px] opacity-50", theme.surface.highlight)} />
        ))}
      </div>
    </div>
  );
});
