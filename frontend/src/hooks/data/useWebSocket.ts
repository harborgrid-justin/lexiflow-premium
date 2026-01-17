import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';

import { WEBSOCKET_CONFIG } from '@/config/network/websocket.config';

/**
 * WebSocket Connection Status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * WebSocket Options
 */
export interface WebSocketOptions {
  namespace?: string; // e.g., '/notifications', '/messaging', '/dashboard'
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  auth?: {
    token?: string;
  };
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onReconnect?: (attemptNumber: number) => void;
}

/**
 * WebSocket Event Listener
 */
export type EventListener<T = unknown> = (data: T) => void;

/**
 * useWebSocket Hook
 *
 * Manages WebSocket connection with automatic reconnection and event handling.
 *
 * Features:
 * - Automatic connection management
 * - Exponential backoff reconnection
 * - Event subscription/unsubscription
 * - Connection status tracking
 * - Error handling
 * - Type-safe event emissions
 * - Cleanup on unmount
 *
 * GLOBAL SINGLETON DEPENDENCIES (G55):
 * WARNING: This hook has hidden dependencies on global singletons:
 * - localStorage (auth token retrieval)
 * - window.location (WS URL construction)
 * - import.meta.env (environment config)
 * 
 * IMPROVEMENT NEEDED (G55): Make these explicit parameters:
 * - Pass auth token via options.auth.token (not localStorage)
 * - Pass wsUrl via options.url (not window.location)
 * - Inject config via options (not import.meta.env)
 * 
 * Current design reduces testability and breaks isolation under parallel rendering.
 * TODO: Refactor to dependency injection pattern
 *
 * EXPLICIT ASYNC STATE (G51):
 * - status: Discriminated union of connection states
 * - error: First-class error state
 * - reconnectAttempt: Explicit retry count
 *
 * @example
 * ```tsx
 * const { socket, status, isConnected, emit, on, off } = useWebSocket({
 *   namespace: '/notifications',
 *   auth: { token: userToken },
 *   onConnect: () => console.log('Connected!'),
 * });
 *
 * // Listen to events
 * useEffect(() => {
 *   const handler = (data) => console.log('Notification:', data);
 *   on('notification:new', handler);
 *   return () => off('notification:new', handler);
 * }, [on, off]);
 *
 * // Emit events
 * emit('notification:mark-read', { notificationId: '123' });
 * ```
 */
export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    namespace = '',
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = WEBSOCKET_CONFIG.reconnect.attempts,
    reconnectionDelay = WEBSOCKET_CONFIG.reconnect.delayMs,
    auth,
    onConnect,
    onDisconnect,
    onError,
    onReconnect,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const eventListenersRef = useRef<Map<string, Set<EventListener>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get auth token from storage or options
   */
  const getAuthToken = useCallback(() => {
    if (auth?.token) {
      return auth.token;
    }

    // Try to get token from localStorage
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        return authData.accessToken || authData.token;
      } catch {
        return null;
      }
    }

    return null;
  }, [auth]);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setStatus(ConnectionStatus.CONNECTING);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      const authError = new Error('No authentication token available');
      setError(authError);
      setStatus(ConnectionStatus.ERROR);
      onError?.(authError);
      return;
    }

    // Construct WebSocket URL
    const wsUrl = import.meta.env.VITE_WS_URL ||
                  (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
                  window.location.host;

    try {
      const socket = io(wsUrl + namespace, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
        reconnectionDelayMax: reconnectionDelay * WEBSOCKET_CONFIG.reconnect.backoffMultiplier,
        timeout: 20000,
        autoConnect,
      });

      // Connection event handlers
      socket.on('connect', () => {
        setStatus(ConnectionStatus.CONNECTED);
        setReconnectAttempt(0);
        setError(null);
        onConnect?.();
      });

      socket.on('disconnect', (reason: string) => {
        setStatus(ConnectionStatus.DISCONNECTED);
        onDisconnect?.(reason);
      });

      socket.on('connect_error', (err: Error) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setStatus(ConnectionStatus.ERROR);
        onError?.(error);
      });

      socket.on('reconnect_attempt', (attemptNumber: number) => {
        setStatus(ConnectionStatus.RECONNECTING);
        setReconnectAttempt(attemptNumber);
        onReconnect?.(attemptNumber);
      });

      socket.on('reconnect', (attemptNumber: number) => {
        setStatus(ConnectionStatus.CONNECTED);
        setReconnectAttempt(0);
        onReconnect?.(attemptNumber);
      });

      socket.on('reconnect_failed', () => {
        setStatus(ConnectionStatus.ERROR);
        const reconnectError = new Error('Reconnection failed after maximum attempts');
        setError(reconnectError);
        onError?.(reconnectError);
      });

      socket.on('error', (err: Error) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      });

      socketRef.current = socket;

      // Re-attach existing event listeners
      for (const [event, listeners] of eventListenersRef.current.entries()) {
        for (const listener of listeners) {
          socket.on(event, listener);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus(ConnectionStatus.ERROR);
      onError?.(error);
    }
  }, [
    namespace,
    autoConnect,
    reconnection,
    reconnectionAttempts,
    reconnectionDelay,
    getAuthToken,
    onConnect,
    onDisconnect,
    onError,
    onReconnect,
  ]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  /**
   * Emit event to server
   */
  const emit = useCallback(<T = unknown>(event: string, data?: T): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(event, data, (response: unknown) => {
        resolve(response);
      });
    });
  }, []);

  /**
   * Subscribe to event
   */
  const on = useCallback(<T = unknown>(event: string, listener: EventListener<T>) => {
    if (!eventListenersRef.current.has(event)) {
      eventListenersRef.current.set(event, new Set());
    }
    eventListenersRef.current.get(event)!.add(listener as EventListener);

    if (socketRef.current) {
      socketRef.current.on(event, listener);
    }
  }, []);

  /**
   * Unsubscribe from event
   */
  const off = useCallback(<T = unknown>(event: string, listener?: EventListener<T>) => {
    if (listener) {
      const listeners = eventListenersRef.current.get(event);
      if (listeners) {
        listeners.delete(listener as EventListener);
        if (listeners.size === 0) {
          eventListenersRef.current.delete(event);
        }
      }

      if (socketRef.current) {
        socketRef.current.off(event, listener);
      }
    } else {
      // Remove all listeners for event
      eventListenersRef.current.delete(event);
      if (socketRef.current) {
        socketRef.current.off(event);
      }
    }
  }, []);

  /**
   * Subscribe to event once
   */
  const once = useCallback(<T = unknown>(event: string, listener: EventListener<T>) => {
    if (socketRef.current) {
      socketRef.current.once(event, listener);
    }
  }, []);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect && WEBSOCKET_CONFIG.enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    status,
    isConnected: status === ConnectionStatus.CONNECTED,
    isConnecting: status === ConnectionStatus.CONNECTING,
    isReconnecting: status === ConnectionStatus.RECONNECTING,
    error,
    reconnectAttempt,
    connect,
    disconnect,
    emit,
    on,
    off,
    once,
  };
}

/**
 * Hook to listen to a specific WebSocket event
 *
 * @example
 * ```tsx
 * useWebSocketEvent(socket, 'notification:new', (data) => {
 *   console.log('New notification:', data);
 * });
 * ```
 */
export function useWebSocketEvent<T = unknown>(
  socket: Socket | null,
  event: string,
  handler: EventListener<T>,
) {
  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}