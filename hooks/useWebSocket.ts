/**
 * useWebSocket Hook
 * React hook for WebSocket communication with automatic connection management
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { websocketClient, ConnectionStatus, WS_EVENTS } from '../services/api/websocketClient';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

interface UseWebSocketResult {
  isConnected: boolean;
  status: ConnectionStatus;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Hook for WebSocket communication
 *
 * @example
 * const { isConnected, emit, on, off } = useWebSocket({ autoConnect: true });
 *
 * useEffect(() => {
 *   const handleNotification = (data) => {
 *     console.log('Received notification:', data);
 *   };
 *
 *   on(WS_EVENTS.NOTIFICATION, handleNotification);
 *
 *   return () => {
 *     off(WS_EVENTS.NOTIFICATION, handleNotification);
 *   };
 * }, [on, off]);
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketResult {
  const { autoConnect = false, reconnectOnMount = true } = options;

  const [status, setStatus] = useState<ConnectionStatus>(websocketClient.getStatus());
  const [isConnected, setIsConnected] = useState(websocketClient.isConnected());

  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  // Update status when it changes
  useEffect(() => {
    const handleStatusChange = (data: { status: ConnectionStatus }) => {
      setStatus(data.status);
      setIsConnected(data.status === ConnectionStatus.CONNECTED);
    };

    websocketClient.on('status', handleStatusChange);

    return () => {
      websocketClient.off('status', handleStatusChange);
    };
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !websocketClient.isConnected()) {
      websocketClient.connect().catch(error => {
        console.error('[useWebSocket] Auto-connect failed:', error);
      });
    }
  }, [autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove all listeners registered through this hook
      listenersRef.current.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          websocketClient.off(event, callback);
        });
      });
      listenersRef.current.clear();
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    websocketClient.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    // Track listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    // Register with WebSocket client
    websocketClient.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (callback) {
      // Remove specific callback
      const callbacks = listenersRef.current.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          listenersRef.current.delete(event);
        }
      }
    } else {
      // Remove all callbacks for event
      listenersRef.current.delete(event);
    }

    // Unregister from WebSocket client
    websocketClient.off(event, callback);
  }, []);

  const connect = useCallback(async () => {
    try {
      await websocketClient.connect();
    } catch (error) {
      console.error('[useWebSocket] Connect failed:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketClient.disconnect();
  }, []);

  return {
    isConnected,
    status,
    emit,
    on,
    off,
    connect,
    disconnect,
  };
}

// Re-export WS_EVENTS for convenience
export { WS_EVENTS };

export default useWebSocket;
