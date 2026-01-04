/**
 * NotificationBadge Component
 * Displays unread notification count with animated indicator
 */



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
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  const sizeClasses = {
    sm: 'h-4 min-w-[1rem] text-[10px] px-1',
    md: 'h-5 min-w-[1.25rem] text-xs px-1.5',
    lg: 'h-6 min-w-[1.5rem] text-sm px-2',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
  };

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <span
        className={`inline-flex items-center justify-center rounded-full font-semibold ${sizeClasses[size]} ${variantClasses[variant]}`}
      >
        {displayCount}
      </span>
      {pulse && count > 0 && (
        <span
          className={`absolute inset-0 animate-ping rounded-full opacity-75 ${variantClasses[variant]}`}
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
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 ${className}`}
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
