/**
 * @module hooks/useLiveDocketFeed
 * @category Hooks - Real-time
 * @description WebSocket connection hook for live docket feed with reconnection logic
 * and connection status monitoring
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface LiveDocketFeedConfig {
  courtId?: string;
  caseId?: string;
  enabled?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onEntry?: (entry: any) => void;
}

export interface LiveDocketFeedResult {
  status: ConnectionStatus;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  lastUpdate: Date | null;
  entriesReceived: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

// ============================================================================
// HOOK
// ============================================================================

export function useLiveDocketFeed({
  courtId,
  caseId,
  enabled = false,
  reconnectAttempts = DEFAULT_RECONNECT_ATTEMPTS,
  reconnectDelay = DEFAULT_RECONNECT_DELAY,
  onEntry
}: LiveDocketFeedConfig = {}): LiveDocketFeedResult {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [entriesReceived, setEntriesReceived] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const currentReconnectDelayRef = useRef(reconnectDelay);
  
  /**
   * Calculate exponential backoff delay
   */
  const getNextReconnectDelay = useCallback(() => {
    const delay = currentReconnectDelayRef.current;
    currentReconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
    return delay;
  }, []);
  
  /**
   * Reset reconnection state
   */
  const resetReconnectState = useCallback(() => {
    reconnectCountRef.current = 0;
    currentReconnectDelayRef.current = reconnectDelay;
  }, [reconnectDelay]);
  
  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus('connecting');
    setError(null);
    
    try {
      // NOTE: In production, this would be a real WebSocket URL
      // For this implementation, we'll simulate WebSocket behavior
      
      // Simulate connection delay
      setTimeout(() => {
        setStatus('connected');
        resetReconnectState();
        
        // Simulate receiving entries periodically
        const simulationInterval = setInterval(() => {
          if (onEntry) {
            const mockEntry = {
              id: `dk-live-${Date.now()}`,
              sequenceNumber: Math.floor(Math.random() * 1000),
              caseId: caseId || 'CASE-LIVE',
              courtId: courtId || 'COURT-LIVE',
              date: new Date().toISOString().split('T')[0],
              type: ['Filing', 'Order', 'Notice'][Math.floor(Math.random() * 3)],
              title: 'LIVE: New Docket Entry',
              description: 'Simulated live feed entry',
              filedBy: 'Court Clerk',
              isSealed: false
            };
            
            onEntry(mockEntry);
            setLastUpdate(new Date());
            setEntriesReceived(prev => prev + 1);
          }
        }, 5000); // Every 5 seconds
        
        // Store cleanup function
        wsRef.current = {
          close: () => {
            clearInterval(simulationInterval);
            setStatus('disconnected');
          }
        } as any;
      }, 1000);
      
      // In real implementation:
      /*
      const wsUrl = `wss://api.lexiflow.com/docket/live?courtId=${courtId}&caseId=${caseId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setStatus('connected');
        resetReconnectState();
      };
      
      ws.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data);
          if (onEntry) {
            onEntry(entry);
          }
          setLastUpdate(new Date());
          setEntriesReceived(prev => prev + 1);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
      
      ws.onerror = (event) => {
        setError('WebSocket connection error');
        setStatus('error');
      };
      
      ws.onclose = (event) => {
        setStatus('disconnected');
        
        // Attempt reconnection if not a normal close
        if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          const delay = getNextReconnectDelay();
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          setError(`Failed to reconnect after ${reconnectAttempts} attempts`);
        }
      };
      
      wsRef.current = ws;
      */
      
    } catch (e) {
      setError(`Connection failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setStatus('error');
    }
  }, [courtId, caseId, onEntry, reconnectAttempts, getNextReconnectDelay, resetReconnectState]);
  
  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus('disconnected');
    resetReconnectState();
  }, [resetReconnectState]);
  
  /**
   * Auto-connect when enabled
   */
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  return {
    status,
    isConnected: status === 'connected',
    error,
    connect,
    disconnect,
    lastUpdate,
    entriesReceived
  };
}
