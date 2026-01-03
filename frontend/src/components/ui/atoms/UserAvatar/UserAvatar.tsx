/**
 * @module components/common/UserAvatar
 * @category Common
 * @description User avatar with status indicator.
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
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { User } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  indicatorStatus?: User['status'];
}

/**
 * UserAvatar - React 18 optimized with React.memo
 */
export const UserAvatar = React.memo<UserAvatarProps>(({ name, size = 'md', className = '', indicatorStatus }) => {
  const { theme } = useTheme();

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  const indicatorColors = {
    online: theme.chart.colors.success,
    offline: theme.chart.colors.neutral,
    busy: theme.chart.colors.danger,
    away: theme.chart.colors.warning
  };

  const displayName = name || '?';
  const initials = displayName.substring(0, 2).toUpperCase();
  const charCode = displayName.charCodeAt(0) || 0;
  
  let colorClass = cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);

  if (charCode % 4 === 1) {
     colorClass = cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border);
  } else if (charCode % 4 === 2) {
     colorClass = cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
  } else if (charCode % 4 === 3) {
     // Previously hardcoded purple, now utilizing chart secondary or status info with manual override if needed for variety
     colorClass = cn(theme.status.neutral.bg, theme.primary.text, theme.status.neutral.border);
  }

  return (
    <div className="relative inline-block">
      <div className={cn(
        sizeClasses[size],
        colorClass,
        "rounded-full flex items-center justify-center font-bold shrink-0 border select-none",
        className
      )}>
        {initials}
      </div>
      {indicatorStatus && (
        <span 
            className={cn(
                "absolute bottom-0 right-0 block rounded-full ring-2",
                theme.surface.default.includes('slate-9') ? 'ring-slate-900' : 'ring-white',
                size === 'xs' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'
            )} 
            style={{ backgroundColor: indicatorColors[indicatorStatus] }}
        />
      )}
    </div>
  );
});
