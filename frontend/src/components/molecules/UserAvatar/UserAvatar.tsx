/**
 * @module components/ui/molecules/UserAvatar
 * @category UI Components
 * @description User avatar component with automatic initials, customizable size, and theme support.
 */

import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';
import { User } from 'lucide-react';
import React from 'react';

// ========================================
// TYPES & INTERFACES
// ========================================
export interface UserAvatarProps {
  /** User object with name and optional avatar URL */
  user?: {
    name?: string;
    avatar?: string;
    avatarUrl?: string;
    email?: string;
    [key: string]: unknown;
  };
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show online status indicator */
  showStatus?: boolean;
  /** Online status */
  isOnline?: boolean;
}

// ========================================
// SIZE MAP
// ========================================
const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const STATUS_SIZE_MAP = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

// ========================================
// COMPONENT
// ========================================
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  className,
  size = 'sm',
  showStatus = false,
  isOnline = false,
}) => {
  const { theme } = useTheme();

  const getInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
    }
    return user.name[0]!.toUpperCase();
  };

  const getAvatarColor = () => {
    // Generate a consistent color based on user name
    const colors = [
      theme.primary.main,
      theme.chart.colors.purple,
      theme.chart.colors.success,
      theme.chart.colors.warning,
      theme.chart.colors.info,
      theme.chart.colors.primary,
      theme.chart.colors.secondary,
      theme.chart.colors.neutral,
    ];
    if (!user?.name) return colors[0];
    const charCode = user.name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {user?.avatar || user?.avatarUrl ? (
        <img
          src={user.avatar || user.avatarUrl}
          alt={user.name || 'User'}
          className={cn(
            'rounded-full object-cover',
            SIZE_MAP[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full text-white flex items-center justify-center font-semibold',
            SIZE_MAP[size],
            'bg-transparent'
          )}
          style={{ backgroundColor: getAvatarColor() }}
        >
          {user?.name ? (
            getInitials()
          ) : (
            <User className={size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} />
          )}
        </div>
      )}

      {showStatus && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800',
            STATUS_SIZE_MAP[size]
          )}
          style={{ backgroundColor: isOnline ? theme.status.success.bg : theme.surface.default }}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

UserAvatar.displayName = 'UserAvatar';
