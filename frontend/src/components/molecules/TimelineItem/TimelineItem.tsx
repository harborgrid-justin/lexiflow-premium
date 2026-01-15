/**
 * @module components/common/TimelineItem
 * @category Common
 * @description Timeline item with icon and connecting line.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Components
import { DateText } from '@/components/atoms/DateText';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TimelineItemProps {
  date: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  colorClass?: string; // e.g. 'bg-blue-500'
  onClick?: () => void;
  isLast?: boolean;
}

/**
 * TimelineItem - React 18 optimized with React.memo
 */
export const TimelineItem = React.memo<TimelineItemProps>(({
  date, title, description, icon, colorClass = 'bg-slate-400', onClick, isLast
}) => {
  const { theme } = useTheme();

  return (
    <div
      className="relative pl-10 h-full flex flex-col justify-center group py-2"
      style={{ contentVisibility: 'auto' } as React.CSSProperties}
    >
      {/* Connecting Line */}
      {!isLast && (
        <div style={{ borderColor: 'var(--color-border)' }} className={cn("absolute left-[11px] top-6 bottom-[-24px] w-0.5 transition-colors hover:bg-slate-300")}></div>
      )}

      {/* Icon Dot */}
      <div className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white z-10 transition-transform duration-200 group-hover:scale-110",
        colorClass
      )}>
        {icon}
      </div>

      {/* Content - Compact Layout */}
      <div
        className={cn("flex flex-col justify-center h-full min-w-0 pr-2 transition-opacity", onClick ? 'cursor-pointer' : '')}
        onClick={onClick}
        title={description} // Native tooltip for zero-clutter detail access
      >
        <div className="flex justify-between items-baseline gap-2 w-full">
          <span className={cn("text-sm font-semibold truncate", theme.text.primary, onClick ? cn("transition-colors", `group-hover:${theme.colors.info}`) : "")}>
            {title}
          </span>
          <DateText date={date} className={cn("font-mono text-[10px] whitespace-nowrap shrink-0 opacity-60", theme.text.tertiary)} />
        </div>

        {description && (
          <p className={cn("text-xs truncate opacity-60 mt-0.5 font-medium", theme.text.secondary)}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
