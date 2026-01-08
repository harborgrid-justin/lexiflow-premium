import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface AnalyticsSubscription {
  dashboardType: 'executive' | 'firm' | 'practice_group' | 'attorney' | 'client' | 'financial';
  filters: {
    organizationId?: string;
    startDate: string;
    endDate: string;
  };
}

interface AnalyticsMessage {
  type: string;
  data: any;
  timestamp: Date;
}

interface UseAnalyticsWebSocketOptions {
  url?: string;
  userId?: string;
  autoConnect?: boolean;
}

export function useAnalyticsWebSocket(options: UseAnalyticsWebSocketOptions = {}) {
  const {
    url = process.env.REACT_APP_WS_URL || 'http://localhost:3000',
    userId = 'anonymous',
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<AnalyticsMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Create socket connection
    const socket = io(`${url}/analytics`, {
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Analytics WebSocket connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Analytics WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connection:established', (data) => {
      console.log('Connection established:', data);
    });

    socket.on('analytics:data', (message: AnalyticsMessage) => {
      console.log('Received analytics data:', message);
      setLastMessage(message);
    });

    socket.on('analytics:update', (message: AnalyticsMessage) => {
      console.log('Received analytics update:', message);
      setLastMessage(message);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(err);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(new Error(err));
    });

    return () => {
      socket.disconnect();
    };
  }, [url, userId, autoConnect]);

  const subscribe = useCallback((subscription: AnalyticsSubscription) => {
    if (!socketRef.current) {
      console.error('Socket not connected');
      return;
    }

    socketRef.current.emit('analytics:subscribe', subscription, (response: any) => {
      console.log('Subscription response:', response);
    });
  }, []);

  const unsubscribe = useCallback((dashboardType: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('analytics:unsubscribe', { dashboardType }, (response: any) => {
      console.log('Unsubscribe response:', response);
    });
  }, []);

  const refresh = useCallback((dashboardType: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('analytics:refresh', { dashboardType }, (response: any) => {
      console.log('Refresh response:', response);
    });
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    subscribe,
    unsubscribe,
    refresh,
  };
}
