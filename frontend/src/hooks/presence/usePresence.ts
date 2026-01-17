/**
 * usePresence Hook - Track and manage user presence with real-time updates.
 * @module hooks/presence/usePresence
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "../data/useWebSocket";
import { PresenceOptions, PresenceStatus, UserPresence } from "./types";
import { usePresenceActions } from "./usePresenceActions";

export function usePresence(options: PresenceOptions = {}) {
  const {
    namespace = "/events",
    enabled = true,
    heartbeatInterval = 30000,
    onPresenceUpdate,
  } = options;

  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(
    new Map(),
  );
  const [myStatus, setMyStatus] = useState<PresenceStatus>(
    PresenceStatus.ONLINE,
  );
  const [myActivity, setMyActivity] = useState<string | undefined>();
  const [myCustomStatus, setMyCustomStatus] = useState<string | undefined>();
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, isConnected, emit, on, off } = useWebSocket({
    namespace,
    autoConnect: enabled,
  });

  const actions = usePresenceActions({
    socket,
    isConnected,
    emit: emit as (e: string, d: Record<string, unknown>) => Promise<void>,
    setMyStatus,
    setMyActivity,
    setMyCustomStatus,
    setPresenceMap: setPresenceMap as React.Dispatch<
      React.SetStateAction<Map<string, unknown>>
    >,
  });

  const handlePresenceUpdate = useCallback(
    (update: UserPresence) => {
      setPresenceMap((prev) => new Map(prev).set(update.userId, update));
      onPresenceUpdate?.(update);
    },
    [onPresenceUpdate],
  );

  const handleBulkPresenceUpdate = useCallback(
    (data: {
      users: Array<{
        userId: string;
        status: PresenceStatus;
        lastSeen: string;
      }>;
    }) => {
      setPresenceMap((prev) => {
        const m = new Map(prev);
        data.users.forEach((u) =>
          m.set(u.userId, { ...u, activeConnections: 1 }),
        );
        return m;
      });
    },
    [],
  );

  useEffect(() => {
    if (!socket || !enabled) return;
    on("presence:update", handlePresenceUpdate);
    on("presence:bulk-update", handleBulkPresenceUpdate);
    return () => {
      off("presence:update", handlePresenceUpdate);
      off("presence:bulk-update", handleBulkPresenceUpdate);
    };
  }, [
    socket,
    enabled,
    on,
    off,
    handlePresenceUpdate,
    handleBulkPresenceUpdate,
  ]);

  const sendHeartbeat = useCallback(() => {
    if (!socket || !isConnected) return;
    emit("presence:heartbeat", {
      status: myStatus,
      activity: myActivity,
      customStatus: myCustomStatus,
    }).catch(console.error);
  }, [socket, isConnected, emit, myStatus, myActivity, myCustomStatus]);

  useEffect(() => {
    if (!isConnected || !enabled) {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      return;
    }
    sendHeartbeat();
    heartbeatTimerRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [isConnected, enabled, sendHeartbeat, heartbeatInterval]);

  const getPresence = useCallback(
    (userId: string) => presenceMap.get(userId) || null,
    [presenceMap],
  );
  const getMultiplePresence = useCallback(
    (userIds: string[]) => {
      const result = new Map<string, UserPresence>();
      userIds.forEach((id) =>
        result.set(
          id,
          presenceMap.get(id) || {
            userId: id,
            status: PresenceStatus.OFFLINE,
            lastSeen: new Date().toISOString(),
            activeConnections: 0,
          },
        ),
      );
      return result;
    },
    [presenceMap],
  );
  const getOnlineUsers = useCallback(
    () =>
      Array.from(presenceMap.values()).filter(
        (p) => p.status !== PresenceStatus.OFFLINE,
      ),
    [presenceMap],
  );
  const isUserOnline = useCallback(
    (userId: string) =>
      presenceMap.get(userId)?.status !== PresenceStatus.OFFLINE,
    [presenceMap],
  );

  useEffect(
    () => () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (actions.activityTimeoutRef.current)
        clearTimeout(actions.activityTimeoutRef.current);
    },
    [actions.activityTimeoutRef],
  );

  return {
    presenceMap,
    myStatus,
    myActivity,
    myCustomStatus,
    isConnected,
    getPresence,
    getMultiplePresence,
    getOnlineUsers,
    isUserOnline,
    ...actions,
  };
}
