/**
 * WebSocket Context
 * Global WebSocket connection management with event handling
 */

import React, { createContext, useContext, useEffect, useCallback, useState, useMemo, ReactNode } from 'react';
import { useWebSocket as useWebSocketHook, WS_EVENTS } from '../hooks/useWebSocket';
import { useAuth } from './AuthContext';

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface WebSocketContextType {
  isConnected: boolean;
  status: ConnectionStatus;
  lastMessage: WebSocketMessage | null;
  connectionTime: number | null;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  subscriptions: Set<string>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionTime, setConnectionTime] = useState<number | null>(null);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());

  // Use the WebSocket hook with auto-connect when authenticated
  const {
    isConnected,
    status,
    emit: emitRaw,
    on: onRaw,
    off: offRaw,
    connect,
    disconnect,
  } = useWebSocketHook({
    autoConnect: isAuthenticated,
    reconnectOnMount: true,
  });

  // Track connection time
  useEffect(() => {
    if (isConnected) {
      setConnectionTime(Date.now());
    } else {
      setConnectionTime(null);
    }
  }, [isConnected]);

  // Auto-connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated && !isConnected && status === 'disconnected') {
      connect().catch(err => {
        console.error('[WebSocketContext] Failed to connect:', err);
      });
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, isConnected, status, connect, disconnect]);

  // Wrap emit to track messages
  const emit = useCallback((event: string, data?: any) => {
    emitRaw(event, data);
    setLastMessage({
      event,
      data,
      timestamp: Date.now(),
    });
  }, [emitRaw]);

  // Wrap on to track incoming messages
  const on = useCallback((event: string, callback: (data: any) => void) => {
    const wrappedCallback = (data: any) => {
      setLastMessage({
        event,
        data,
        timestamp: Date.now(),
      });
      callback(data);
    };

    onRaw(event, wrappedCallback);
  }, [onRaw]);

  // Wrap off
  const off = useCallback((event: string, callback?: (data: any) => void) => {
    offRaw(event, callback);
  }, [offRaw]);

  // Subscribe to a channel
  const subscribe = useCallback((channel: string) => {
    if (!subscriptions.has(channel)) {
      emit('subscribe', { channel });
      setSubscriptions(prev => new Set(prev).add(channel));
    }
  }, [subscriptions, emit]);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: string) => {
    if (subscriptions.has(channel)) {
      emit('unsubscribe', { channel });
      setSubscriptions(prev => {
        const next = new Set(prev);
        next.delete(channel);
        return next;
      });
    }
  }, [subscriptions, emit]);

  // Re-subscribe to channels on reconnect
  useEffect(() => {
    if (isConnected && subscriptions.size > 0) {
      subscriptions.forEach(channel => {
        emit('subscribe', { channel });
      });
    }
  }, [isConnected, subscriptions, emit]);

  // Setup default event handlers
  useEffect(() => {
    if (!isConnected) return;

    const handleError = (error: any) => {
      console.error('[WebSocket] Error:', error);
    };

    const handleNotification = (data: any) => {
      console.log('[WebSocket] Notification:', data);
      // Dispatch custom event for notification system
      window.dispatchEvent(
        new CustomEvent('ws:notification', {
          detail: data,
        })
      );
    };

    const handleUpdate = (data: any) => {
      console.log('[WebSocket] Update:', data);
      // Dispatch custom event for update system
      window.dispatchEvent(
        new CustomEvent('ws:update', {
          detail: data,
        })
      );
    };

    on('error', handleError);
    on(WS_EVENTS.NOTIFICATION, handleNotification);
    on('update', handleUpdate);

    return () => {
      off('error', handleError);
      off(WS_EVENTS.NOTIFICATION, handleNotification);
      off('update', handleUpdate);
    };
  }, [isConnected, on, off]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      emit('ping', { timestamp: Date.now() });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, emit]);

  // Memoize context value
  const value = useMemo<WebSocketContextType>(() => ({
    isConnected,
    status: status as ConnectionStatus,
    lastMessage,
    connectionTime,
    emit,
    on,
    off,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    subscriptions,
  }), [
    isConnected,
    status,
    lastMessage,
    connectionTime,
    emit,
    on,
    off,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    subscriptions,
  ]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
export { WS_EVENTS };
