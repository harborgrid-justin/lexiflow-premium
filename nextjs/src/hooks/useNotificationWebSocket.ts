/**
 * useNotificationWebSocket Hook
 *
 * Real-time notification management using WebSocket connection.
 * Connects to the backend notifications gateway and handles real-time events.
 *
 * Features:
 * - Auto-connect/reconnect with exponential backoff
 * - JWT authentication
 * - Real-time notification delivery
 * - Unread count updates
 * - Notification acknowledgment
 * - Connection state management
 * - Error handling and recovery
 * - TypeScript type safety
 *
 * @module useNotificationWebSocket
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

/**
 * WebSocket notification event payload
 */
export interface WebSocketNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  timestamp: string;
}

/**
 * Connection state
 */
export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * Hook options
 */
export interface UseNotificationWebSocketOptions {
  /** Backend URL (defaults to window.location.origin) */
  url?: string;

  /** JWT token for authentication */
  token?: string;

  /** Enable auto-reconnect */
  autoReconnect?: boolean;

  /** Reconnect delay in ms */
  reconnectDelay?: number;

  /** Maximum reconnect attempts */
  maxReconnectAttempts?: number;

  /** Enable debug logging */
  debug?: boolean;

  /** Callback when new notification received */
  onNotification?: (notification: WebSocketNotification) => void;

  /** Callback when notification marked as read */
  onNotificationRead?: (data: {
    notificationId: string;
    userId: string;
  }) => void;

  /** Callback when all notifications marked as read */
  onAllNotificationsRead?: (data: { userId: string }) => void;

  /** Callback when notification deleted */
  onNotificationDeleted?: (data: {
    notificationId: string;
    userId: string;
  }) => void;

  /** Callback when unread count changes */
  onUnreadCountChange?: (count: number) => void;

  /** Callback on connection state change */
  onConnectionChange?: (state: ConnectionState) => void;

  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Hook return value
 */
export interface UseNotificationWebSocketReturn {
  /** Current connection state */
  connectionState: ConnectionState;

  /** Current unread count */
  unreadCount: number;

  /** Mark notification as read */
  markAsRead: (notificationId: string) => void;

  /** Mark all notifications as read */
  markAllAsRead: () => void;

  /** Delete notification */
  deleteNotification: (notificationId: string, wasUnread?: boolean) => void;

  /** Manually connect */
  connect: () => void;

  /** Manually disconnect */
  disconnect: () => void;

  /** Check if connected */
  isConnected: boolean;
}

/**
 * useNotificationWebSocket Hook
 */
export const useNotificationWebSocket = (
  options: UseNotificationWebSocketOptions = {}
): UseNotificationWebSocketReturn => {
  const {
    url: providedUrl,
    token,
    autoReconnect = true,
    reconnectDelay = 1000,
    maxReconnectAttempts = 5,
    debug = false,
    onNotification,
    onNotificationRead,
    onAllNotificationsRead,
    onNotificationDeleted,
    onUnreadCountChange,
    onConnectionChange,
    onError,
  } = options;

  const url =
    providedUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const log = useCallback(
    (message: string, ...args: unknown[]): void => {
      if (debug) {
        console.log(`[NotificationWebSocket] ${message}`, ...args);
      }
    },
    [debug]
  );

  const updateConnectionState = useCallback(
    (state: ConnectionState): void => {
      setConnectionState(state);
      onConnectionChange?.(state);
      log(`Connection state: ${state}`);
    },
    [onConnectionChange, log]
  );

  /**
   * Connect to WebSocket
   */
  const connect = useCallback((): void => {
    if (!token) {
      log("Cannot connect: No authentication token provided");
      return;
    }

    if (socketRef.current?.connected) {
      log("Already connected");
      return;
    }

    log("Connecting to WebSocket...", url);
    updateConnectionState("connecting");

    try {
      // Create socket connection
      const socket = io(`${url}/notifications`, {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
        reconnection: autoReconnect,
        reconnectionDelay: reconnectDelay,
        reconnectionAttempts: maxReconnectAttempts,
      });

      // Connection established
      socket.on("connect", () => {
        log("Connected", socket.id);
        updateConnectionState("connected");
        reconnectAttemptsRef.current = 0;
      });

      // Connection acknowledgment
      socket.on("connected", (data: { userId: string; socketId: string }) => {
        log("Connection acknowledged", data);
      });

      // New notification received
      socket.on("notification:new", (notification: WebSocketNotification) => {
        log("New notification", notification);
        onNotification?.(notification);
      });

      // Notification marked as read
      socket.on(
        "notification:read",
        (data: { notificationId: string; userId: string }) => {
          log("Notification read", data);
          onNotificationRead?.(data);
        }
      );

      // All notifications marked as read
      socket.on("notification:all-read", (data: { userId: string }) => {
        log("All notifications read", data);
        onAllNotificationsRead?.(data);
      });

      // Notification deleted
      socket.on(
        "notification:deleted",
        (data: { notificationId: string; userId: string }) => {
          log("Notification deleted", data);
          onNotificationDeleted?.(data);
        }
      );

      // Unread count update
      socket.on("notification:count", (data: { count: number }) => {
        log("Unread count", data.count);
        setUnreadCount(data.count);
        onUnreadCountChange?.(data.count);
      });

      // Disconnection
      socket.on("disconnect", (reason: string) => {
        log("Disconnected", reason);
        updateConnectionState("disconnected");

        // Auto-reconnect if not manual disconnect
        if (reason !== "io client disconnect" && autoReconnect) {
          scheduleReconnect();
        }
      });

      // Connection error
      socket.on("connect_error", (error: Error) => {
        log("Connection error", error.message);
        updateConnectionState("error");
        onError?.(error);

        if (autoReconnect) {
          scheduleReconnect();
        }
      });

      // Error
      socket.on("error", (error: Error) => {
        log("Socket error", error.message);
        onError?.(error);
      });

      socketRef.current = socket;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Unknown connection error");
      log("Connection failed", err.message);
      updateConnectionState("error");
      onError?.(err);
    }
  }, [
    token,
    url,
    autoReconnect,
    reconnectDelay,
    maxReconnectAttempts,
    onNotification,
    onNotificationRead,
    onAllNotificationsRead,
    onNotificationDeleted,
    onUnreadCountChange,
    onError,
    log,
    updateConnectionState,
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback((): void => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      log("Disconnecting...");
      socketRef.current.disconnect();
      socketRef.current = null;
      updateConnectionState("disconnected");
    }
  }, [log, updateConnectionState]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    (notificationId: string): void => {
      if (!socketRef.current?.connected) {
        log("Cannot mark as read: Not connected");
        return;
      }

      log("Marking as read", notificationId);
      socketRef.current.emit("notification:mark-read", { notificationId });
    },
    [log]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback((): void => {
    if (!socketRef.current?.connected) {
      log("Cannot mark all as read: Not connected");
      return;
    }

    log("Marking all as read");
    socketRef.current.emit("notification:mark-all-read");
  }, [log]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    (notificationId: string, wasUnread = false): void => {
      if (!socketRef.current?.connected) {
        log("Cannot delete: Not connected");
        return;
      }

      log("Deleting notification", notificationId);
      socketRef.current.emit("notification:delete", {
        notificationId,
        wasUnread,
      });
    },
    [log]
  );

  // Auto-connect on mount - use refs with useLayoutEffect to avoid ref mutation during render
  const connectRef = useRef(connect);
  const disconnectRef = useRef(disconnect);

  useLayoutEffect(() => {
    connectRef.current = connect;
    disconnectRef.current = disconnect;
  }, [connect, disconnect]);

  useEffect(() => {
    if (token) {
      connectRef.current();
    }

    // Cleanup on unmount
    return () => {
      disconnectRef.current();
    };
  }, [token]);

  return {
    connectionState,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    connect,
    disconnect,
    isConnected: connectionState === "connected",
  };
};

export default useNotificationWebSocket;
