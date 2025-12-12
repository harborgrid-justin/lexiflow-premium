/**
 * NotificationBadge Component
 * Badge showing unread notification count
 */

import React from 'react';
import { useNotificationStream } from '../../hooks/useNotificationStream';

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
  showZero?: boolean;
  maxCount?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  onClick,
  className = '',
  showZero = false,
  maxCount = 99,
  position = 'top-right',
}) => {
  const { unreadCount } = useNotificationStream();

  // Don't show if count is 0 and showZero is false
  if (unreadCount === 0 && !showZero) {
    return null;
  }

  // Format count (e.g., 99+)
  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();

  // Position classes
  const positionClasses = {
    'top-right': '-top-2 -right-2',
    'top-left': '-top-2 -left-2',
    'bottom-right': '-bottom-2 -right-2',
    'bottom-left': '-bottom-2 -left-2',
  };

  return (
    <span
      className={`absolute ${positionClasses[position]} inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full ${className} ${
        onClick ? 'cursor-pointer hover:bg-red-700' : ''
      }`}
      onClick={onClick}
    >
      {displayCount}
    </span>
  );
};

/**
 * NotificationIcon Component
 * Bell icon with notification badge
 */
interface NotificationIconProps {
  onClick?: () => void;
  className?: string;
  iconSize?: number;
  showBadge?: boolean;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  onClick,
  className = '',
  iconSize = 24,
  showBadge = true,
}) => {
  const { unreadCount } = useNotificationStream();
  const hasUnread = unreadCount > 0;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={onClick}
        className={`p-2 rounded-full transition-colors ${
          hasUnread
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
        }`}
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className={hasUnread ? 'animate-pulse' : ''}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>

      {showBadge && <NotificationBadge />}
    </div>
  );
};

export default NotificationBadge;
