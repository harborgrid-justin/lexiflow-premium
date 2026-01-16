/**
 * NotificationBadge Component
 * Displays unread notification count with animated indicator
 */

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

export interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'danger' | 'warning';
  pulse?: boolean;
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  size = 'md',
  variant = 'primary',
  pulse = false,
  className = '',
}: NotificationBadgeProps) {
  const { theme, tokens } = useTheme();

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  const sizeStyles = {
    sm: { height: '1rem', minWidth: '1rem', fontSize: '10px', padding: '0 0.25rem' },
    md: { height: '1.25rem', minWidth: '1.25rem', fontSize: tokens.typography.fontSize.xs, padding: '0 0.375rem' },
    lg: { height: '1.5rem', minWidth: '1.5rem', fontSize: tokens.typography.fontSize.sm, padding: '0 0.5rem' },
  };

  const variantStyles = {
    primary: { backgroundColor: theme.primary.DEFAULT, color: theme.surface.base },
    danger: { backgroundColor: theme.status.error.text, color: theme.surface.base },
    warning: { backgroundColor: theme.status.warning.text, color: theme.surface.base },
  };

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} className={className}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.borderRadius.full,
          fontWeight: tokens.typography.fontWeight.semibold,
          ...sizeStyles[size],
          ...variantStyles[variant],
        }}
      >
        {displayCount}
      </span>
      {pulse && count > 0 && (
        <span
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: tokens.borderRadius.full,
            opacity: 0.75,
            ...variantStyles[variant],
          }}
          className="animate-ping"
        ></span>
      )}
    </span>
  );
}

export interface NotificationIconProps {
  count: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NotificationIcon({ count, onClick, size = 'md', className = '' }: NotificationIconProps) {
  const { theme } = useTheme();
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <button
      onClick={onClick}
      className={cn("relative rounded-lg p-2 transition-colors", theme.text.secondary, `hover:${theme.surface.hover}`, `hover:${theme.text.primary}`, className)}
      title="Notifications"
    >
      <svg
        className={iconSizeClasses[size]}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {count > 0 && (
        <span className="absolute right-1 top-1">
          <NotificationBadge count={count} size="sm" variant="danger" pulse />
        </span>
      )}
    </button>
  );
}
