/**
 * usePresenceActions - Actions for managing user presence
 * @module hooks/presence/usePresenceActions
 */

import { useCallback, useRef } from 'react';
import { PresenceStatus } from './types';

interface PresenceActionsConfig {
  socket: unknown;
  isConnected: boolean;
  emit: (event: string, data: Record<string, unknown>) => Promise<void>;
  setMyStatus: (status: PresenceStatus) => void;
  setMyActivity: (activity: string | undefined) => void;
  setMyCustomStatus: (status: string | undefined) => void;
  setPresenceMap: React.Dispatch<React.SetStateAction<Map<string, unknown>>>;
}

export function usePresenceActions(config: PresenceActionsConfig) {
  const { socket, isConnected, emit, setMyStatus, setMyActivity, setMyCustomStatus, setPresenceMap } = config;
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setStatus = useCallback(async (status: PresenceStatus) => {
    if (!socket || !isConnected) return;
    setMyStatus(status);
    try { await emit('presence:set-status', { status }); } catch (e) { console.error('Failed to set status:', e); }
  }, [socket, isConnected, emit, setMyStatus]);

  const setActivity = useCallback(async (activity: string | undefined) => {
    if (!socket || !isConnected) return;
    setMyActivity(activity);
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    try {
      if (activity) { await emit('presence:set-activity', { activity }); activityTimeoutRef.current = setTimeout(() => setActivity(undefined), 300000); }
      else { await emit('presence:clear-activity', {}); }
    } catch (e) { console.error('Failed to set activity:', e); }
  }, [socket, isConnected, emit, setMyActivity]);

  const setCustomStatus = useCallback(async (status: string | undefined) => {
    if (!socket || !isConnected) return;
    setMyCustomStatus(status);
    try { await emit(status ? 'presence:set-custom-status' : 'presence:clear-custom-status', status ? { customStatus: status } : {}); }
    catch (e) { console.error('Failed to set custom status:', e); }
  }, [socket, isConnected, emit, setMyCustomStatus]);

  const subscribeToUsers = useCallback(async (userIds: string[]) => {
    if (!socket || !isConnected || !userIds.length) return;
    try { await emit('presence:subscribe', { userIds }); } catch (e) { console.error('Failed to subscribe:', e); }
  }, [socket, isConnected, emit]);

  const unsubscribeFromUsers = useCallback(async (userIds: string[]) => {
    if (!socket || !isConnected || !userIds.length) return;
    try {
      await emit('presence:unsubscribe', { userIds });
      setPresenceMap((prev) => { const m = new Map(prev); userIds.forEach((id) => m.delete(id)); return m; });
    } catch (e) { console.error('Failed to unsubscribe:', e); }
  }, [socket, isConnected, emit, setPresenceMap]);

  return { setStatus, setActivity, setCustomStatus, subscribeToUsers, unsubscribeFromUsers, activityTimeoutRef };
}
