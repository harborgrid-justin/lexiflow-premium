/**
 * Notification Badge Component
 *
 * Displays notification count with various styles and animations.
 * Can be used standalone or attached to other components.
 *
 * Features:
 * - Count display with 99+ overflow
 * - Pulse animation for new notifications
 * - Multiple size variants
 * - Color variants
 * - Dot indicator for compact display
 * - Accessibility support
 *
 * @module NotificationBadge
 */

import React, { useEffect, useState } from 'react';

/**
 * Badge props
 */
export interface NotificationBadgeProps {
  /** Number of notifications */
  count: number;

  /** Maximum count to display before showing "99+" */
  max?: number;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Color variant */
  variant?: 'primary' | 'danger' | 'warning' | 'success';

  /** Show only a dot indicator instead of count */
  dot?: boolean;

  /** Enable pulse animation */
  pulse?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * Size configurations
 */
const SIZES = {
  sm: {
    badge: 'min-w-[16px] h-4 text-[10px] px-1',
    dot: 'w-2 h-2',
  },
  md: {
    badge: 'min-w-[20px] h-5 text-xs px-1.5',
    dot: 'w-2.5 h-2.5',
  },
  lg: {
    badge: 'min-w-[24px] h-6 text-sm px-2',
    dot: 'w-3 h-3',
  },
};

/**
 * Color configurations
 */
const VARIANTS = {
  primary: cn(theme.colors.primary, 'text-white'),
  danger: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  success: 'bg-green-600 text-white',
};

/**
 * Notification Badge Component
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  size = 'md',
  variant = 'danger',
  dot = false,
  pulse = false,
  className = '',
  ariaLabel,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when count changes
  useEffect(() => {
    if (pulse && count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count, pulse]);

  // Show only if count > 0
  if (count <= 0) return null;

  // Format count
  const displayCount = count > max ? `${max}+` : count.toString();

  // Dot variant
  if (dot) {
    return (
      <span
        className={`
          inline-flex rounded-full
          ${SIZES[size].dot}
          ${VARIANTS[variant]}
          ${isAnimating ? 'animate-ping' : ''}
          ${className}
        `}
        role="status"
        aria-label={ariaLabel || `${count} notifications`}
      >
        <span className="sr-only">{count} notifications</span>
      </span>
    );
  }

  // Badge variant
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-bold rounded-full
        ${SIZES[size].badge}
        ${VARIANTS[variant]}
        ${isAnimating ? 'animate-bounce' : ''}
        ${className}
      `}
      role="status"
      aria-label={ariaLabel || `${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

/**
 * Notification Badge with Icon
 * Wraps an icon component with a notification badge
 */
export const NotificationBadgeIcon: React.FC<{
  icon: React.ReactNode;
  count: number;
  badgeProps?: Partial<NotificationBadgeProps>;
  className?: string;
}> = ({ icon, count, badgeProps = {}, className = '' }) => {
  return (
    <div className={`relative inline-flex ${className}`}>
      {icon}
      {count > 0 && (
        <div className="absolute -top-1 -right-1">
          <NotificationBadge count={count} {...badgeProps} />
        </div>
      )}
    </div>
  );
};

/**
 * Inline Notification Badge
 * Displays badge inline with text
 */
export const InlineNotificationBadge: React.FC<{
  label: string;
  count: number;
  badgeProps?: Partial<NotificationBadgeProps>;
  className?: string;
}> = ({ label, count, badgeProps = {}, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span>{label}</span>
      {count > 0 && <NotificationBadge count={count} size="sm" {...badgeProps} />}
    </div>
  );
};

/**
 * Animated Counter Badge
 * Shows count with smooth number transitions
 */
export const AnimatedCounterBadge: React.FC<{
  count: number;
  previousCount?: number;
  badgeProps?: Partial<NotificationBadgeProps>;
}> = ({ count, previousCount = 0, badgeProps = {} }) => {
  const [displayCount, setDisplayCount] = useState(previousCount);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    if (count > displayCount) {
      setIsIncreasing(true);
      const diff = count - displayCount;
      const duration = Math.min(diff * 50, 500); // Max 500ms
      const steps = Math.min(diff, 10);
      const increment = diff / steps;

      let current = displayCount;
      const interval = setInterval(() => {
        current += increment;
        if (current >= count) {
          setDisplayCount(count);
          clearInterval(interval);
          setTimeout(() => setIsIncreasing(false), 300);
        } else {
          setDisplayCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
    setDisplayCount(count);
    return undefined;
  }, [count, displayCount]);

  return (
    <NotificationBadge
      count={displayCount}
      pulse={isIncreasing}
      {...badgeProps}
    />
  );
};

/**
 * Badge Group
 * Groups multiple badges together
 */
export const NotificationBadgeGroup: React.FC<{
  badges: Array<{
    label: string;
    count: number;
    variant?: NotificationBadgeProps['variant'];
  }>; className?: string;
}> = ({ badges, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* IDENTITY-STABLE KEYS: Use label as unique key */}
      {badges.map((badge) => (
        <InlineNotificationBadge
          key={badge.label}
          label={badge.label}
          count={badge.count}
          badgeProps={{ variant: badge.variant }}
        />
      ))}
    </div>
  );
};

export default NotificationBadge;
