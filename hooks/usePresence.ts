import { useEffect, useState, useCallback } from 'react';
import { PresenceService, PresenceData, PresenceStatus, PresenceUpdate } from '../services/presenceService';
import { WebSocketService } from '../services/websocketService';

export function usePresence(ws: WebSocketService | null) {
  const [presences, setPresences] = useState<PresenceData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<PresenceData[]>([]);
  const [presenceService, setPresenceService] = useState<PresenceService | null>(null);

  // Initialize presence service
  useEffect(() => {
    if (!ws) return;

    const service = new PresenceService(ws);
    service.start();
    setPresenceService(service);

    // Subscribe to presence changes
    const unsubscribe = service.onPresenceChange((newPresences) => {
      setPresences(newPresences);
      setOnlineUsers(service.getOnlineUsers());
    });

    return () => {
      unsubscribe();
      service.stop();
      service.cleanup();
    };
  }, [ws]);

  const updatePresence = useCallback(
    (update: PresenceUpdate) => {
      presenceService?.updatePresence(update);
    },
    [presenceService],
  );

  const subscribeToUsers = useCallback(
    (userIds: string[]) => {
      presenceService?.subscribeToUsers(userIds);
    },
    [presenceService],
  );

  const unsubscribeFromUsers = useCallback(
    (userIds: string[]) => {
      presenceService?.unsubscribeFromUsers(userIds);
    },
    [presenceService],
  );

  const getPresence = useCallback(
    (userId: string) => {
      return presenceService?.getPresence(userId);
    },
    [presenceService],
  );

  return {
    presences,
    onlineUsers,
    updatePresence,
    subscribeToUsers,
    unsubscribeFromUsers,
    getPresence,
  };
}

export default usePresence;
