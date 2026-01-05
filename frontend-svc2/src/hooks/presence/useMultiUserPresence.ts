/**
 * useMultiUserPresence Hook
 * Track presence for multiple users efficiently.
 * @module hooks/presence/useMultiUserPresence
 */

import { useEffect } from "react";
import { PresenceStatus } from "./types";
import { usePresence } from "./usePresence";

/**
 * Track presence for multiple users efficiently.
 * @example
 * const userIds = ['user-1', 'user-2', 'user-3'];
 * const { presenceMap, onlineCount, offlineCount } = useMultiUserPresence(userIds);
 */
export function useMultiUserPresence(userIds: string[]) {
  const { getMultiplePresence, subscribeToUsers, unsubscribeFromUsers } =
    usePresence();

  const presenceMap = getMultiplePresence(userIds);

  useEffect(() => {
    if (userIds.length > 0) {
      subscribeToUsers(userIds);
      return () => {
        unsubscribeFromUsers(userIds);
      };
    }
    return undefined;
  }, [userIds, subscribeToUsers, unsubscribeFromUsers]);

  const presenceValues = Array.from(presenceMap.values());
  const onlineCount = presenceValues.filter(
    (p) => p.status === PresenceStatus.ONLINE
  ).length;
  const awayCount = presenceValues.filter(
    (p) => p.status === PresenceStatus.AWAY
  ).length;
  const busyCount = presenceValues.filter(
    (p) => p.status === PresenceStatus.BUSY
  ).length;
  const offlineCount = presenceValues.filter(
    (p) => p.status === PresenceStatus.OFFLINE
  ).length;

  return {
    presenceMap,
    onlineCount,
    awayCount,
    busyCount,
    offlineCount,
    totalCount: userIds.length,
  };
}
