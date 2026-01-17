/**
 * Socket.io Service
 * Real-time communication service for messaging, notifications, and presence
 *
 * @module SocketService
 * @description Provides real-time features including:
 * - Message delivery status tracking
 * - Typing indicators
 * - Online presence
 * - Real-time notifications
 * - Connection management and reconnection logic
 */

import { io, type Socket } from "socket.io-client";

import type {
  Message,
  OnlinePresence,
  TypingIndicator,
} from "@/api/communications/messaging-api";
import type { ApiNotification } from "@/api/communications/notifications-api";

export interface SocketConfig {
  url: string;
  auth?: {
    token?: string;
  };
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface SocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onReconnect?: (attempt: number) => void;

  // Messaging events
  onNewMessage?: (message: Message) => void;
  onMessageDelivered?: (messageId: string, userId: string) => void;
  onMessageRead?: (messageId: string, userId: string) => void;
  onTyping?: (indicator: TypingIndicator) => void;
  onPresenceUpdate?: (presence: OnlinePresence) => void;

  // Notification events
  onNewNotification?: (notification: ApiNotification) => void;
  onNotificationRead?: (notificationId: string) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private handlers: SocketEventHandlers = {};
  private isConnecting = false;
  private reconnectAttempts = 0;

  /**
   * Initialize Socket.io connection
   */
  async connect(
    config: SocketConfig,
    handlers: SocketEventHandlers = {},
  ): Promise<void> {
    if (this.socket?.connected) {
      console.log("[SocketService] Already connected");
      return;
    }

    if (this.isConnecting) {
      console.log("[SocketService] Connection already in progress");
      return;
    }

    this.isConnecting = true;
    this.handlers = handlers;

    try {
      console.log("[SocketService] Connecting to", config.url);

      this.socket = io(config.url, {
        ...(config.auth ? { auth: config.auth } : {}),
        reconnection: config.reconnection ?? true,
        reconnectionAttempts: config.reconnectionAttempts ?? 5,
        reconnectionDelay: config.reconnectionDelay ?? 1000,
        transports: ["websocket", "polling"],
      });

      this.registerEventHandlers();
      this.isConnecting = false;

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Socket connection timeout"));
        }, 10000);

        this.socket?.once("connect", () => {
          clearTimeout(timeout);
          console.log("[SocketService] Connected successfully");
          resolve();
        });

        this.socket?.once("connect_error", (error) => {
          clearTimeout(timeout);
          console.error("[SocketService] Connection error:", error);
          reject(error);
        });
      });
    } catch (error) {
      this.isConnecting = false;
      console.error("[SocketService] Failed to initialize socket:", error);
      throw error;
    }
  }

  /**
   * Register all event handlers
   */
  private registerEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("[SocketService] Connected");
      this.reconnectAttempts = 0;
      this.handlers.onConnect?.();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[SocketService] Disconnected:", reason);
      this.handlers.onDisconnect?.(reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[SocketService] Connection error:", error);
      this.handlers.onError?.(error);
    });

    this.socket.on("reconnect", (attempt) => {
      console.log("[SocketService] Reconnected after", attempt, "attempts");
      this.reconnectAttempts = attempt;
      this.handlers.onReconnect?.(attempt);
    });

    // Messaging events
    this.socket.on("message:new", (message: Message) => {
      console.log("[SocketService] New message received:", message.id);
      this.handlers.onNewMessage?.(message);
    });

    this.socket.on(
      "message:delivered",
      (data: { messageId: string; userId: string }) => {
        console.log("[SocketService] Message delivered:", data.messageId);
        this.handlers.onMessageDelivered?.(data.messageId, data.userId);
      },
    );

    this.socket.on(
      "message:read",
      (data: { messageId: string; userId: string }) => {
        console.log("[SocketService] Message read:", data.messageId);
        this.handlers.onMessageRead?.(data.messageId, data.userId);
      },
    );

    this.socket.on("user:typing", (indicator: TypingIndicator) => {
      this.handlers.onTyping?.(indicator);
    });

    this.socket.on("user:presence", (presence: OnlinePresence) => {
      this.handlers.onPresenceUpdate?.(presence);
    });

    // Notification events
    this.socket.on("notification:new", (notification: ApiNotification) => {
      console.log("[SocketService] New notification:", notification.id);
      this.handlers.onNewNotification?.(notification);
    });

    this.socket.on("notification:read", (notificationId: string) => {
      console.log("[SocketService] Notification read:", notificationId);
      this.handlers.onNotificationRead?.(notificationId);
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      console.log("[SocketService] Disconnecting");
      this.socket.disconnect();
      this.socket = null;
      this.handlers = {};
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn("[SocketService] Cannot join conversation - not connected");
      return;
    }
    this.socket.emit("conversation:join", { conversationId });
    console.log("[SocketService] Joined conversation:", conversationId);
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("conversation:leave", { conversationId });
    console.log("[SocketService] Left conversation:", conversationId);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("typing", { conversationId, isTyping });
  }

  /**
   * Update presence status
   */
  updatePresence(isOnline: boolean): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("presence:update", { isOnline });
  }

  /**
   * Mark message as delivered
   */
  markMessageDelivered(messageId: string, conversationId: string): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("message:delivered", { messageId, conversationId });
  }

  /**
   * Mark message as read
   */
  markMessageRead(messageId: string, conversationId: string): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("message:read", { messageId, conversationId });
  }

  /**
   * Subscribe to notification updates
   */
  subscribeToNotifications(): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("notifications:subscribe");
    console.log("[SocketService] Subscribed to notifications");
  }

  /**
   * Unsubscribe from notification updates
   */
  unsubscribeFromNotifications(): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("notifications:unsubscribe");
    console.log("[SocketService] Unsubscribed from notifications");
  }

  /**
   * Update event handlers
   */
  updateHandlers(handlers: Partial<SocketEventHandlers>): void {
    this.handlers = {
      ...this.handlers,
      ...handlers,
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    transportType?: string;
  } {
    const transportType = this.socket?.io.engine.transport.name;
    return {
      connected: this.socket?.connected ?? false,
      reconnectAttempts: this.reconnectAttempts,
      ...(transportType ? { transportType } : {}),
    };
  }

  /**
   * Emit custom event
   */
  emit(event: string, data: unknown): void {
    if (!this.socket?.connected) {
      console.warn(`[SocketService] Cannot emit ${event} - not connected`);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen to custom event
   */
  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.socket) {
      console.warn(
        `[SocketService] Cannot listen to ${event} - socket not initialized`,
      );
      return;
    }
    this.socket.on(event, handler);
  }

  /**
   * Remove custom event listener
   */
  off(event: string, handler?: (...args: unknown[]) => void): void {
    if (!this.socket) {
      return;
    }
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
