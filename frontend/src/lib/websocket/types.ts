/**
 * WebSocket Provider Types
 * Type definitions for WebSocket context
 *
 * @module lib/websocket/types
 */

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface WebSocketStateValue {
  status: WebSocketStatus;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  reconnectAttempts: number;
}

export interface WebSocketActionsValue {
  connect: (url?: string) => void;
  disconnect: () => void;
  send: (type: string, payload: unknown) => void;
  subscribe: (
    messageType: string,
    handler: (payload: unknown) => void
  ) => () => void;
}

export interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
