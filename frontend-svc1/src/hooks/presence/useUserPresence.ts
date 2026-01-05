/**
 * useUserPresence Hook
 * Track presence for a specific user.
 * @module hooks/presence/useUserPresence
 */

import { useEffect } from 'react';
import { PresenceStatus } from './types';
import { usePresence } from './usePresence';

/**
 * Track presence for a specific user.
 * @example
 * const { presence, isOnline, isAway } = useUserPresence('user-123');
 */
export function useUserPresence(userId: string) {
  const { getPresence, subscribeToUsers, unsubscribeFromUsers } = usePresence();

  const presence = getPresence(userId);

  useEffect(() => {
    if (userId) {
      subscribeToUsers([userId]);
      return () => {
        unsubscribeFromUsers([userId]);
      };
    }
    return undefined;
  }, [userId, subscribeToUsers, unsubscribeFromUsers]);

  return {
    presence,
    isOnline: presence?.status === PresenceStatus.ONLINE,
    isAway: presence?.status === PresenceStatus.AWAY,
    isBusy: presence?.status === PresenceStatus.BUSY,
    isOffline: !presence || presence.status === PresenceStatus.OFFLINE,
    lastSeen: presence?.lastSeen,
    currentActivity: presence?.currentActivity,
    customStatus: presence?.customStatus,
  };
}
