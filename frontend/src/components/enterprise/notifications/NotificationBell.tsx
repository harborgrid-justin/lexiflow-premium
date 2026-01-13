/**
 * @module components/enterprise/notifications/NotificationBell
 * @category Enterprise - Notifications
 * @description Bell icon with animated badge counter for real-time notifications
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount: number;
  /** Click handler to open notification panel */
  onClick: () => void;
  /** Optional className for custom styling */
  className?: string;
  /** Whether the panel is currently open */
  isOpen?: boolean;
  /** Enable/disable animation */
  animated?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'primary' | 'ghost';
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
const NotificationBellComponent: React.FC<NotificationBellProps> = ({
  unreadCount = 0,
  onClick,
  className,
  isOpen = false,
  animated = true,
  size = 'md',
  variant = 'default',
  ariaLabel = 'Notifications',
}) => {
  const [prevCount, setPrevCount] = useState(unreadCount);
  const [shouldShake, setShouldShake] = useState(false);

  // Trigger shake animation when count increases
  useEffect(() => {
    if (animated && unreadCount > prevCount && unreadCount > 0) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => {
        clearTimeout(timer);
      };
    }
    if (prevCount !== unreadCount) {
      setPrevCount(unreadCount);
    }
    return undefined;
  }, [unreadCount, prevCount, animated]);

  // Size mappings
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const badgeSizeClasses = {
    sm: 'h-4 w-4 text-[9px]',
    md: 'h-5 w-5 text-[10px]',
    lg: 'h-6 w-6 text-xs',
  };

  // Variant styles
  const variantClasses = {
    default: cn(
      'bg-slate-100 hover:bg-slate-200',
      'dark:bg-slate-700 dark:hover:bg-slate-600',
      'text-slate-700 dark:text-slate-200'
    ),
    primary: cn(
      'bg-blue-50 hover:bg-blue-100',
      'dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
      'text-blue-600 dark:text-blue-400'
    ),
    ghost: cn(
      'bg-transparent hover:bg-slate-100',
      'dark:hover:bg-slate-800',
      'text-slate-600 dark:text-slate-300'
    ),
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonSizeClasses[size],
        variantClasses[variant],
        isOpen && 'bg-slate-200 dark:bg-slate-600',
        className
      )}
      whileTap={{ scale: 0.95 }}
      animate={shouldShake ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
      transition={{ duration: 0.5 }}
      aria-label={`${ariaLabel}${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      <Bell className={sizeClasses[size]} />

      {/* Animated Badge Counter */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center',
              'bg-gradient-to-br from-red-500 to-red-600',
              'text-white font-bold rounded-full',
              'border-2 border-white dark:border-slate-900',
              'shadow-lg',
              badgeSizeClasses[size]
            )}
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Pulse indicator for new notifications */}
      {unreadCount > 0 && animated && (
        <motion.span
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
};

export const NotificationBell = React.memo(NotificationBellComponent);
NotificationBell.displayName = 'NotificationBell';
export default NotificationBell;
