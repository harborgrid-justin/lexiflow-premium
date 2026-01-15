// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - WEBSOCKET (INFRASTRUCTURE)
// ================================================================================

/**
 * WebSocket Provider - Infrastructure Layer
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Real-time Communication
 *
 * RESPONSIBILITIES:
 * • WebSocket connection lifecycle (connect, disconnect)
 * • Message pub/sub system (subscribe to message types)
 * • Automatic reconnection with backoff
 * • Connection status monitoring
 * • Message routing to subscribers
 *
 * REACT 18 PATTERNS:
 * ✓ Split state/actions contexts
 * ✓ Refs for WebSocket instance (mutable)
 * ✓ Cleanup functions for connections
 * ✓ StrictMode compatible (idempotent connect)
 * ✓ Memoized callbacks
 *
 * CROSS-CUTTING CAPABILITY:
 * • ServiceProvider subscribes to health updates
 * • Domain providers can subscribe to real-time data
 * • Pub/sub pattern for decoupled communication
 *
 * USAGE PATTERN:
 * ```tsx
 * const { subscribe } = useWebSocket();
 *
 * useEffect(() => {
 *   const unsubscribe = subscribe('case_update', (data) => {
 *     console.log('Case updated:', data);
 *   });
 *   return unsubscribe;
 * }, [subscribe]);
 * ```
 *
 * @module providers/infrastructure/websocketprovider
 */

import { WebSocketActionsContext, WebSocketStateContext } from '@/lib/websocket/contexts';
import type { WebSocketActionsValue, WebSocketMessage, WebSocketProviderProps, WebSocketStateValue, WebSocketStatus } from '@/lib/websocket/types';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export function WebSocketProvider({
  children,
  url = 'ws://localhost:3000/ws',
  autoConnect = false,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: WebSocketProviderProps) {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribersRef = useRef<Map<string, Set<(payload: unknown) => void>>>(new Map());

  const connect = useCallback((customUrl?: string) => {
    const wsUrl = customUrl || url;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocketProvider] Already connected');
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocketProvider] Connected');
        setStatus('connected');
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);

          // Notify subscribers
          const handlers = subscribersRef.current.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message.payload));
          }
        } catch (err) {
          console.error('[WebSocketProvider] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocketProvider] Error:', event);
        setError(new Error('WebSocket error'));
        setStatus('error');
      };

      ws.onclose = () => {
        console.log('[WebSocketProvider] Disconnected');
        setStatus('disconnected');
        wsRef.current = null;

        // Auto-reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const backoffDelay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttempts),
            30000 // Max 30 seconds
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect(wsUrl);
          }, backoffDelay);
        } else {
          console.error('[WebSocketProvider] Max reconnection attempts reached');
          setError(new Error('Failed to reconnect to WebSocket'));
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocketProvider] Connection failed:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      setStatus('error');
    }
  }, [url, reconnectInterval, maxReconnectAttempts, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('disconnected');
    setReconnectAttempts(0);
  }, []);

  const send = useCallback((type: string, payload: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketProvider] Cannot send - not connected');
      return;
    }

    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    wsRef.current.send(JSON.stringify(message));
  }, []);

  const subscribe = useCallback((messageType: string, handler: (payload: unknown) => void) => {
    if (!subscribersRef.current.has(messageType)) {
      subscribersRef.current.set(messageType, new Set());
    }

    subscribersRef.current.get(messageType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = subscribersRef.current.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          subscribersRef.current.delete(messageType);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  const stateValue = useMemo<WebSocketStateValue>(() => ({
    status,
    isConnected: status === 'connected',
    lastMessage,
    error,
    reconnectAttempts,
  }), [status, lastMessage, error, reconnectAttempts]);

  const actionsValue = useMemo<WebSocketActionsValue>(() => ({
    connect,
    disconnect,
    send,
    subscribe,
  }), [connect, disconnect, send, subscribe]);

  return (
    <WebSocketStateContext.Provider value={stateValue}>
      <WebSocketActionsContext.Provider value={actionsValue}>
        {children}
      </WebSocketActionsContext.Provider>
    </WebSocketStateContext.Provider>
  );
}

export function useWebSocketState(): WebSocketStateValue {
  const context = useContext(WebSocketStateContext);
  if (!context) {
    throw new Error('useWebSocketState must be used within WebSocketProvider');
  }
  return context;
}

export function useWebSocketActions(): WebSocketActionsValue {
  const context = useContext(WebSocketActionsContext);
  if (!context) {
    throw new Error('useWebSocketActions must be used within WebSocketProvider');
  }
  return context;
}

export function useWebSocket() {
  return {
    state: useWebSocketState(),
    actions: useWebSocketActions(),
  };
}
