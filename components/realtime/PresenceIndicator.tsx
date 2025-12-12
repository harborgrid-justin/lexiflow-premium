import React from 'react';

export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showLastSeen?: boolean;
  lastSeen?: Date;
  customStatus?: string;
  className?: string;
  onClick?: () => void;
}

const statusColors: Record<PresenceStatus, string> = {
  [PresenceStatus.ONLINE]: 'bg-green-500',
  [PresenceStatus.AWAY]: 'bg-yellow-500',
  [PresenceStatus.BUSY]: 'bg-red-500',
  [PresenceStatus.OFFLINE]: 'bg-gray-400',
};

const statusLabels: Record<PresenceStatus, string> = {
  [PresenceStatus.ONLINE]: 'Online',
  [PresenceStatus.AWAY]: 'Away',
  [PresenceStatus.BUSY]: 'Busy',
  [PresenceStatus.OFFLINE]: 'Offline',
};

const sizeClasses = {
  small: 'w-2 h-2',
  medium: 'w-3 h-3',
  large: 'w-4 h-4',
};

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  status,
  size = 'medium',
  showLabel = false,
  showLastSeen = false,
  lastSeen,
  customStatus,
  className = '',
  onClick,
}) => {
  const getLastSeenText = () => {
    if (!lastSeen) return '';

    const now = Date.now();
    const diff = now - lastSeen.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const renderDot = () => (
    <span className="relative inline-flex">
      <span
        className={`
          ${sizeClasses[size]}
          ${statusColors[status]}
          rounded-full
          ${status === PresenceStatus.ONLINE ? 'animate-pulse' : ''}
        `}
      />
      {status === PresenceStatus.ONLINE && (
        <span
          className={`
            absolute inline-flex h-full w-full rounded-full
            ${statusColors[status]} opacity-75 animate-ping
          `}
        />
      )}
    </span>
  );

  if (!showLabel && !showLastSeen && !customStatus) {
    return (
      <span
        className={`inline-flex items-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
        title={statusLabels[status]}
      >
        {renderDot()}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {renderDot()}
      <div className="flex flex-col">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {statusLabels[status]}
          </span>
        )}
        {customStatus && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {customStatus}
          </span>
        )}
        {showLastSeen && lastSeen && status === PresenceStatus.OFFLINE && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getLastSeenText()}
          </span>
        )}
      </div>
    </div>
  );
};

// Component for displaying multiple user presences
export interface UserPresence {
  userId: string;
  userName: string;
  status: PresenceStatus;
  lastSeen?: Date;
  customStatus?: string;
  avatarUrl?: string;
}

export interface PresenceListProps {
  users: UserPresence[];
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  onUserClick?: (userId: string) => void;
  className?: string;
}

export const PresenceList: React.FC<PresenceListProps> = ({
  users,
  maxDisplay = 5,
  size = 'medium',
  showLabels = true,
  onUserClick,
  className = '',
}) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = Math.max(0, users.length - maxDisplay);

  return (
    <div className={`space-y-2 ${className}`}>
      {displayUsers.map((user) => (
        <div
          key={user.userId}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => onUserClick?.(user.userId)}
        >
          {user.avatarUrl ? (
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.userName}
                className="w-8 h-8 rounded-full"
              />
              <span className="absolute -bottom-0.5 -right-0.5">
                <PresenceIndicator status={user.status} size="small" />
              </span>
            </div>
          ) : (
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {user.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5">
                <PresenceIndicator status={user.status} size="small" />
              </span>
            </div>
          )}
          {showLabels && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.userName}
              </p>
              {user.customStatus && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.customStatus}
                </p>
              )}
            </div>
          )}
          <PresenceIndicator
            status={user.status}
            size={size}
            showLastSeen={user.status === PresenceStatus.OFFLINE}
            lastSeen={user.lastSeen}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
};

// Compact presence avatars (stacked)
export interface PresenceAvatarsProps {
  users: UserPresence[];
  maxDisplay?: number;
  size?: number;
  className?: string;
  onViewAll?: () => void;
}

export const PresenceAvatars: React.FC<PresenceAvatarsProps> = ({
  users,
  maxDisplay = 4,
  size = 32,
  className = '',
  onViewAll,
}) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = Math.max(0, users.length - maxDisplay);

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <div
            key={user.userId}
            className="relative ring-2 ring-white dark:ring-gray-800 rounded-full"
            style={{ zIndex: displayUsers.length - index }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.userName}
                className="rounded-full"
                style={{ width: size, height: size }}
                title={`${user.userName} - ${statusLabels[user.status]}`}
              />
            ) : (
              <div
                className="rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center"
                style={{ width: size, height: size }}
                title={`${user.userName} - ${statusLabels[user.status]}`}
              >
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {user.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span
              className="absolute bottom-0 right-0"
              style={{ transform: 'translate(25%, 25%)' }}
            >
              <PresenceIndicator status={user.status} size="small" />
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className="relative ring-2 ring-white dark:ring-gray-800 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            style={{ width: size, height: size }}
            onClick={onViewAll}
            title={`${remainingCount} more users`}
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceIndicator;
