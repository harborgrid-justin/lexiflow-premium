/**
 * @module hooks/integration/useWebSocket
 * @category Hooks - Backend Integration
 * 
 * WebSocket connection management for real-time updates.
 * Provides automatic reconnection, message handling, and presence tracking.
 * 
 * FEATURES:
 * - Automatic connection management
 * - Reconnection with exponential backoff
 * - Type-safe message handling
 * - Connection state tracking
 * - Heartbeat/ping-pong
 * 
 * @example
 * ```typescript
 * const { 
 *   isConnected, 
 *   send, 
 *   lastMessage 
 * } = useWebSocket('/api/ws', {
 *   onMessage: (data) => {
 *     console.log('Received:', data);
 *   },
 *   onError: (error) => {
 *     console.error('WebSocket error:', error);
 *   }
 * });
 * 
 * // Send message
 * send({ type: 'subscribe', channel: 'cases' });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

/**
 * WebSocket connection state
 */
export type WebSocketState = 
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'error';

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp?: number;
}

/**
 * Options for useWebSocket
 */
export interface UseWebSocketOptions<T = unknown> {
  /** Callback when message received */
  onMessage?: (data: T) => void;
  /** Callback on connection open */
  onOpen?: () => void;
  /** Callback on connection close */
  onClose?: (event: CloseEvent) => void;
  /** Callback on error */
  onError?: (error: Event) => void;
  /** Enable automatic reconnection */
  autoReconnect?: boolean;
  /** Max reconnection attempts (0 = infinite) */
  maxReconnectAttempts?: number;
  /** Initial reconnect delay in ms */
  reconnectDelay?: number;
  /** Max reconnect delay in ms */
  maxReconnectDelay?: number;
  /** Heartbeat interval in ms (0 = disabled) */
  heartbeatInterval?: number;
  /** Heartbeat timeout in ms */
  heartbeatTimeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Return type for useWebSocket
 */
export interface UseWebSocketReturn<T = unknown> {
  /** Current connection state */
  state: WebSocketState;
  /** Is connected */
  isConnected: boolean;
  /** Send message */
  send: (data: T | string) => void;
  /** Last received message */
  lastMessage: T | null;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Reconnect attempts */
  reconnectAttempts: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * WebSocket connection hook with automatic reconnection.
 * 
 * @param url - WebSocket URL
 * @param options - Configuration options
 * @returns WebSocket state and controls
 */
export function useWebSocket<T = unknown>(
  url: string,
  {
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    maxReconnectAttempts = 10,
    reconnectDelay = 1000,
    maxReconnectDelay = 30000,
    heartbeatInterval = 30000,
    heartbeatTimeout = 5000,
    debug = false
  }: UseWebSocketOptions<T> = {}
): UseWebSocketReturn<T> {
  const [state, setState] = useState<WebSocketState>('disconnected');
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const log = useCallback((...args: unknown[]) => {
    if (debug) {
      console.log('[WebSocket]', ...args);
    }
  }, [debug]);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Sending heartbeat');
      wsRef.current.send(JSON.stringify({ type: 'ping' }));

      // Set timeout for pong response
      heartbeatTimeoutRef.current = setTimeout(() => {
        log('Heartbeat timeout - reconnecting');
        wsRef.current?.close();
      }, heartbeatTimeout);
    }
  }, [log, heartbeatTimeout]);

  // Setup heartbeat
  const setupHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      clearTimeouts();
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    }
  }, [heartbeatInterval, sendHeartbeat, clearTimeouts]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      log('Already connected or connecting');
      return;
    }

    log('Connecting to', url);
    setState('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        
        log('Connected');
        setState('connected');
        setReconnectAttempts(0);
        setupHeartbeat();
        onOpen?.();
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        // Clear heartbeat timeout on any message
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = null;
        }

        try {
          const data = JSON.parse(event.data) as T;
          
          // Handle pong response
          if ((data as { type?: string }).type === 'pong') {
            log('Received pong');
            return;
          }

          log('Message received:', data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          log('Failed to parse message:', error);
        }
      };

      ws.onerror = (event) => {
        if (!mountedRef.current) return;
        
        log('Error:', event);
        setState('error');
        onError?.(event);
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        
        log('Closed:', event.code, event.reason);
        setState('disconnected');
        clearTimeouts();
        onClose?.(event);

        // Auto-reconnect
        if (autoReconnect && 
            (maxReconnectAttempts === 0 || reconnectAttempts < maxReconnectAttempts)) {
          const delay = Math.min(
            reconnectDelay * Math.pow(2, reconnectAttempts),
            maxReconnectDelay
          );
          
          log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

    } catch (error) {
      log('Connection error:', error);
      setState('error');
    }
  }, [
    url,
    autoReconnect,
    maxReconnectAttempts,
    reconnectAttempts,
    reconnectDelay,
    maxReconnectDelay,
    onOpen,
    onMessage,
    onClose,
    onError,
    log,
    setupHeartbeat,
    clearTimeouts
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    log('Disconnecting');
    setState('disconnecting');
    clearTimeouts();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setState('disconnected');
  }, [log, clearTimeouts]);

  // Send message
  const send = useCallback((data: T | string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      log('Sending:', message);
      wsRef.current.send(message);
    } else {
      log('Cannot send - not connected');
    }
  }, [log]);

  // Auto-connect on mount
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    state,
    isConnected: state === 'connected',
    send,
    lastMessage,
    connect,
    disconnect,
    reconnectAttempts
  };
}

/**
 * Hook for subscribing to WebSocket channel.
 * 
 * @param url - WebSocket URL
 * @param channel - Channel to subscribe to
 * @param onMessage - Message handler
 * @returns WebSocket state and controls
 */
export function useWebSocketChannel<T = unknown>(
  url: string,
  channel: string,
  onMessage: (data: T) => void
): UseWebSocketReturn<T> {
  const ws = useWebSocket<T>(url, {
    onMessage,
    onOpen: () => {
      ws.send({ type: 'subscribe', channel });
    }
  });

  return ws;
}
