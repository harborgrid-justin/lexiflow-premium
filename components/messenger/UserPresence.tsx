import React, { useState, useEffect, useMemo } from 'react';
import { Circle } from 'lucide-react';
import { chatService, PresenceUpdate } from '../../services/chatService';
import { cn } from '../../utils/cn';

/**
 * UserPresence Component
 *
 * Displays user online/offline status with real-time updates
 * Features:
 * - Real-time presence updates via WebSocket
 * - Online/Offline/Away status indicators
 * - Last seen timestamp
 * - Customizable size and position
 */

export type PresenceStatus = 'online' | 'offline' | 'away';

interface UserPresenceProps {
  userId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'inline';
  className?: string;
}

const STATUS_COLORS: Record<PresenceStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

const STATUS_LABELS: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
};

const SIZE_CLASSES = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

const POSITION_CLASSES = {
  'top-right': 'absolute -top-0.5 -right-0.5',
  'bottom-right': 'absolute -bottom-0.5 -right-0.5',
  'bottom-left': 'absolute -bottom-0.5 -left-0.5',
  'top-left': 'absolute -top-0.5 -left-0.5',
  inline: 'relative inline-block',
};

export const UserPresence: React.FC<UserPresenceProps> = ({
  userId,
  showLabel = false,
  size = 'md',
  position = 'bottom-right',
  className,
}) => {
  const [status, setStatus] = useState<PresenceStatus>('offline');
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  // Subscribe to presence updates
  useEffect(() => {
    const unsubscribe = chatService.onPresence((update: PresenceUpdate) => {
      if (update.userId === userId) {
        setStatus(update.status as PresenceStatus);
        if (update.status === 'offline') {
          setLastSeen(update.timestamp);
        } else {
          setLastSeen(null);
        }
      }
    });

    return unsubscribe;
  }, [userId]);

  const statusColor = STATUS_COLORS[status];
  const statusLabel = STATUS_LABELS[status];
  const sizeClass = SIZE_CLASSES[size];
  const positionClass = POSITION_CLASSES[position];

  const formattedLastSeen = useMemo(() => {
    if (!lastSeen || status !== 'offline') return null;

    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }, [lastSeen, status]);

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('rounded-full', sizeClass, statusColor, 'ring-2 ring-white')} />
        <span className="text-sm text-gray-600">
          {statusLabel}
          {formattedLastSeen && ` (${formattedLastSeen})`}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(positionClass, className)}
      title={`${statusLabel}${formattedLastSeen ? ` - Last seen ${formattedLastSeen}` : ''}`}
    >
      <div className={cn('rounded-full', sizeClass, statusColor, 'ring-2 ring-white')} />
    </div>
  );
};

/**
 * PresenceIndicator Component
 *
 * Simple presence indicator without user tracking
 */
interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const statusColor = STATUS_COLORS[status];
  const statusLabel = STATUS_LABELS[status];
  const sizeClass = SIZE_CLASSES[size];

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('rounded-full', sizeClass, statusColor)} />
        <span className="text-sm text-gray-600">{statusLabel}</span>
      </div>
    );
  }

  return <div className={cn('rounded-full', sizeClass, statusColor, className)} />;
};

/**
 * PresenceList Component
 *
 * Displays a list of users with their presence status
 */
interface PresenceListProps {
  userIds: string[];
  getUserName?: (userId: string) => string;
  className?: string;
}

export const PresenceList: React.FC<PresenceListProps> = ({
  userIds,
  getUserName,
  className,
}) => {
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceStatus>>(new Map());

  useEffect(() => {
    const unsubscribe = chatService.onPresence((update: PresenceUpdate) => {
      if (userIds.includes(update.userId)) {
        setPresenceMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(update.userId, update.status as PresenceStatus);
          return newMap;
        });
      }
    });

    return unsubscribe;
  }, [userIds]);

  const sortedUsers = useMemo(() => {
    return [...userIds].sort((a, b) => {
      const statusA = presenceMap.get(a) || 'offline';
      const statusB = presenceMap.get(b) || 'offline';

      // Sort by status: online > away > offline
      const statusPriority = { online: 3, away: 2, offline: 1 };
      return statusPriority[statusB] - statusPriority[statusA];
    });
  }, [userIds, presenceMap]);

  return (
    <div className={cn('space-y-2', className)}>
      {sortedUsers.map((userId) => {
        const status = presenceMap.get(userId) || 'offline';
        const userName = getUserName ? getUserName(userId) : userId;

        return (
          <div key={userId} className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <UserPresence userId={userId} size="sm" position="bottom-right" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{userName}</div>
              <div className="text-sm text-gray-500">
                {STATUS_LABELS[status]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserPresence;
