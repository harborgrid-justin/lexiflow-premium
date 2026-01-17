/**
 * @module components/common/CalendarEvent
 * @category Common
 * @description Calendar event item with variants.
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
import { useTheme } from "@/hooks/useTheme";

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface CalendarEventProps {
  title: string;
  time?: string;
  variant?: 'default' | 'critical' | 'success' | 'warning' | 'info';
  onClick?: () => void;
  icon?: React.ReactNode;
  isCompact?: boolean;
}

/**
 * CalendarEvent - React 18 optimized with React.memo
 */
export const CalendarEvent = React.memo<CalendarEventProps>(({
  title,
  time,
  variant = 'default',
  onClick,
  icon,
  isCompact = false
}) => {
  const { theme } = useTheme();

  const variants = {
    default: cn(theme.surface.highlight, theme.text.primary, theme.border.default, `hover:${theme.border.default}`),
    critical: cn(theme.status.error.bg, theme.status.error.border, theme.status.error.text, "hover:opacity-80"),
    success: cn(theme.status.success.bg, theme.status.success.border, theme.status.success.text, "hover:opacity-80"),
    warning: cn(theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text, "hover:opacity-80"),
    info: cn(theme.status.info.bg, theme.status.info.border, theme.status.info.text, "hover:opacity-80"),
  };

  return (
    <div
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClick?.(); }}
      className={cn(
        "group flex items-center px-2 py-1 rounded border text-xs font-medium cursor-pointer transition-all mb-1 truncate",
        variants[variant],
        isCompact ? "h-6" : "h-auto"
      )}
      title={`${time ? time + ' - ' : ''}${title}`}
    >
      {icon && <span className="mr-1.5 shrink-0 opacity-70 group-hover:opacity-100">{icon}</span>}
      <div className="flex-1 truncate">
        {time && <span className="mr-1 opacity-75 font-mono text-[10px]">{time}</span>}
        <span>{title}</span>
      </div>
    </div>
  );
});
