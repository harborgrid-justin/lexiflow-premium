/**
 * @module hooks/useLiveDocketFeed
 * @category Hooks - Real-time
 * @description WebSocket connection hook for live docket feed with reconnection logic
 * and connection status monitoring
 */

import {
  WS_RECONNECT_ATTEMPTS,
  WS_RECONNECT_BACKOFF_MULTIPLIER,
  WS_RECONNECT_DELAY_MS,
  getWsUrl,
} from "@/config/network/websocket.config";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface LiveDocketFeedConfig {
  courtId?: string;
  caseId?: string;
  enabled?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onEntry?: (entry: unknown) => void;
  onNewEntry?: (entry: unknown) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface LiveDocketFeedResult {
  status: ConnectionStatus;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  lastUpdate: Date | null;
  entriesReceived: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_RECONNECT_ATTEMPTS = WS_RECONNECT_ATTEMPTS;
const DEFAULT_RECONNECT_DELAY = WS_RECONNECT_DELAY_MS;
const MAX_RECONNECT_DELAY =
  WS_RECONNECT_DELAY_MS *
  Math.pow(WS_RECONNECT_BACKOFF_MULTIPLIER, WS_RECONNECT_ATTEMPTS);

// ============================================================================
// HOOK
// ============================================================================

export function useLiveDocketFeed({
  courtId,
  caseId,
  enabled = false,
  reconnectAttempts = DEFAULT_RECONNECT_ATTEMPTS,
  reconnectDelay = DEFAULT_RECONNECT_DELAY,
  onEntry,
  onNewEntry,
  // These parameters are removed as they were unused
}: LiveDocketFeedConfig = {}): LiveDocketFeedResult {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
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

    setStatus("connecting");
    setError(null);

    try {
      const wsUrl = `${getWsUrl()}/docket/live?courtId=${courtId || ""}&caseId=${caseId || ""}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStatus("connected");
        resetReconnectState();
      };

      ws.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data);
          if (onEntry) {
            onEntry(entry);
          }
          if (onNewEntry) {
            onNewEntry(entry);
          }
          setLastUpdate(new Date());
          setEntriesReceived((prev) => prev + 1);
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection error");
        setStatus("error");
      };

      ws.onclose = (event) => {
        setStatus("disconnected");

        // Attempt reconnection if not a normal close
        if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          const delay = getNextReconnectDelay();

          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, delay);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          setError(`Failed to reconnect after ${reconnectAttempts} attempts`);
        }
      };

      wsRef.current = ws;
    } catch (e) {
      setError(
        `Connection failed: ${e instanceof Error ? e.message : "Unknown error"}`
      );
      setStatus("error");
    }
  }, [
    courtId,
    caseId,
    onEntry,
    onNewEntry,
    reconnectAttempts,
    getNextReconnectDelay,
    resetReconnectState,
  ]);

  // Update ref in effect since we cannot mutate during render
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

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

    setStatus("disconnected");
    resetReconnectState();
  }, [resetReconnectState]);

  /**
   * Auto-connect when enabled
   */
  useEffect(() => {
    let mounted = true;

    if (enabled) {
      // Defer connection to avoid synchronous state update in effect
      const timer = setTimeout(() => {
        if (mounted) connect();
      }, 0);
      return () => {
        mounted = false;
        clearTimeout(timer);
        // Avoid sync setState in cleanup effect
        setTimeout(disconnect, 0);
      };
    } else {
      setTimeout(disconnect, 0);
    }
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
    isConnected: status === "connected",
    error,
    connect,
    disconnect,
    reconnect: connect,
    lastUpdate,
    entriesReceived,
  };
}
