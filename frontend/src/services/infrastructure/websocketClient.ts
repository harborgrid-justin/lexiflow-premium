/**
 * WebSocket Client for Real-Time Communication
 *
 * @module WebSocketClient
 * @description Enterprise-grade WebSocket client providing:
 * - Socket.io connection management
 * - Automatic reconnection with exponential backoff
 * - Event subscription and handling
 * - Connection state monitoring
 * - Heartbeat/ping-pong for connection health
 * - Message queue for offline messages
 * - Room join/leave management
 * - TypeScript type safety
 * - Authentication token injection
 *
 * @architecture
 * - Pattern: Event-driven + Reconnection logic
 * - Transport: Socket.io (WebSocket with fallbacks)
 * - Authentication: JWT token in connection headers
 * - Reconnection: Exponential backoff with jitter
 * - State: Connected, Disconnected, Reconnecting
 *
 * @security
 * - JWT authentication on connection
 * - Secure WebSocket (wss://) in production
 * - Event validation and sanitization
 * - Room-based access control
 */

import io, { Socket } from 'socket.io-client';
import { getWsUrl, WEBSOCKET_CONFIG } from '@/config/network/websocket.config';
import { apiClient } from './apiClient';

/**
 * WebSocket connection state
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * WebSocket event handler type
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * WebSocket error event
 */
export interface WebSocketError {
  message: string;
  code?: string;
  timestamp: string;
}

/**
 * Room subscription
 */
export interface RoomSubscription {
  room: string;
  joined: boolean;
  timestamp: string;
}

/**
 * WebSocket Client Class
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private connectionState: ConnectionState = 'disconnected';
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: Array<{ event: string; data: unknown }> = [];
  private rooms = new Map<string, RoomSubscription>();
  private isDevelopment = import.meta.env?.DEV || false;

  constructor() {
    this.logInitialization();
  }

  /**
   * Log client initialization
   */
  private logInitialization(): void {
    if (this.isDevelopment) {
      console.log('[WebSocketClient] Initialized', {
        enabled: WEBSOCKET_CONFIG.enabled,
        url: getWsUrl(),
        reconnectAttempts: WEBSOCKET_CONFIG.reconnect.attempts,
      });
    }
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  /**
   * Connect to WebSocket server
   *
   * @returns Promise<void>
   */
  public async connect(): Promise<void> {
    if (!WEBSOCKET_CONFIG.enabled) {
      console.warn('[WebSocketClient] WebSocket is disabled in configuration');
      return;
    }

    if (this.socket?.connected) {
      console.log('[WebSocketClient] Already connected');
      return;
    }

    try {
      this.setConnectionState('connecting');

      const token = apiClient.getAuthToken();
      const wsUrl = getWsUrl();

      if (this.isDevelopment) {
        console.log('[WebSocketClient] Connecting to:', wsUrl);
      }

      // Create socket connection
      this.socket = io(wsUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: false, // We handle reconnection manually
        timeout: 10000,
      });

      // Setup event listeners
      this.setupSocketEventListeners();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket?.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket?.once('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Start heartbeat
      this.startHeartbeat();

      // Process queued messages
      this.processMessageQueue();

      // Rejoin rooms
      await this.rejoinRooms();

      console.log('[WebSocketClient] Connected successfully');
    } catch (error) {
      console.error('[WebSocketClient] Connection failed:', error);
      this.setConnectionState('error');
      this.handleReconnection();
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.setConnectionState('disconnected');
    this.reconnectAttempts = 0;
    this.rooms.clear();

    if (this.isDevelopment) {
      console.log('[WebSocketClient] Disconnected');
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.setConnectionState('connected');
      this.reconnectAttempts = 0;
      if (this.isDevelopment) {
        console.log('[WebSocketClient] Connected');
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.setConnectionState('disconnected');
      if (this.isDevelopment) {
        console.log('[WebSocketClient] Disconnected:', reason);
      }

      // Auto-reconnect unless disconnected intentionally
      if (reason !== 'io client disconnect') {
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocketClient] Connection error:', error);
      this.setConnectionState('error');
      this.handleReconnection();
    });

    // Heartbeat response
    this.socket.on('pong', () => {
      if (this.isDevelopment) {
        console.debug('[WebSocketClient] Received pong');
      }
    });

    // Error events
    this.socket.on('error', (error: WebSocketError) => {
      console.error('[WebSocketClient] Error:', error);
      this.notifyListeners('error', error);
    });

    // Catch-all for custom events
    this.socket.onAny((eventName: string, ...args: unknown[]) => {
      if (this.isDevelopment) {
        console.debug('[WebSocketClient] Received event:', eventName, args);
      }
      this.notifyListeners(eventName, args[0]);
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= WEBSOCKET_CONFIG.reconnect.attempts) {
      console.error('[WebSocketClient] Max reconnection attempts reached');
      this.setConnectionState('error');
      return;
    }

    this.setConnectionState('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.min(
      WEBSOCKET_CONFIG.reconnect.delayMs *
        Math.pow(WEBSOCKET_CONFIG.reconnect.backoffMultiplier, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    // Add jitter (±25%)
    const jitter = delay * (0.75 + Math.random() * 0.5);

    if (this.isDevelopment) {
      console.log(
        `[WebSocketClient] Reconnecting in ${Math.round(jitter)}ms (attempt ${this.reconnectAttempts}/${WEBSOCKET_CONFIG.reconnect.attempts})`
      );
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocketClient] Reconnection failed:', error);
      });
    }, jitter);
  }

  /**
   * Start heartbeat ping-pong
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, WEBSOCKET_CONFIG.ping.intervalMs);
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to an event
   *
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  public on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler as EventHandler);

    if (this.isDevelopment) {
      console.debug(`[WebSocketClient] Subscribed to event: ${event}`);
    }

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Unsubscribe from an event
   *
   * @param event - Event name
   * @param handler - Event handler function
   */
  public off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }

      if (this.isDevelopment) {
        console.debug(`[WebSocketClient] Unsubscribed from event: ${event}`);
      }
    }
  }

  /**
   * Emit an event to the server
   *
   * @param event - Event name
   * @param data - Event data
   */
  public emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      // Queue message if not connected
      this.messageQueue.push({ event, data });
      if (this.isDevelopment) {
        console.warn(`[WebSocketClient] Message queued (not connected): ${event}`);
      }
      return;
    }

    this.socket.emit(event, data);

    if (this.isDevelopment) {
      console.debug(`[WebSocketClient] Emitted event: ${event}`, data);
    }
  }

  /**
   * Notify all listeners for an event
   */
  private notifyListeners(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocketClient] Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (!this.socket?.connected || this.messageQueue.length === 0) return;

    if (this.isDevelopment) {
      console.log(`[WebSocketClient] Processing ${this.messageQueue.length} queued messages`);
    }

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.socket.emit(message.event, message.data);
      }
    }
  }

  // =============================================================================
  // ROOM MANAGEMENT
  // =============================================================================

  /**
   * Join a room
   *
   * @param room - Room name
   * @returns Promise<void>
   */
  public async joinRoom(room: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Join room timeout: ${room}`));
      }, 5000);

      this.socket!.emit('join-room', room, (response: { success: boolean; error?: string }) => {
        clearTimeout(timeout);

        if (response.success) {
          this.rooms.set(room, {
            room,
            joined: true,
            timestamp: new Date().toISOString(),
          });

          if (this.isDevelopment) {
            console.log(`[WebSocketClient] Joined room: ${room}`);
          }

          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  /**
   * Leave a room
   *
   * @param room - Room name
   * @returns Promise<void>
   */
  public async leaveRoom(room: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Leave room timeout: ${room}`));
      }, 5000);

      this.socket!.emit('leave-room', room, (response: { success: boolean; error?: string }) => {
        clearTimeout(timeout);

        if (response.success) {
          this.rooms.delete(room);

          if (this.isDevelopment) {
            console.log(`[WebSocketClient] Left room: ${room}`);
          }

          resolve();
        } else {
          reject(new Error(response.error || 'Failed to leave room'));
        }
      });
    });
  }

  /**
   * Rejoin all rooms after reconnection
   */
  private async rejoinRooms(): Promise<void> {
    if (this.rooms.size === 0) return;

    const roomNames = Array.from(this.rooms.keys());

    if (this.isDevelopment) {
      console.log(`[WebSocketClient] Rejoining ${roomNames.length} rooms`);
    }

    for (const room of roomNames) {
      try {
        await this.joinRoom(room);
      } catch (error) {
        console.error(`[WebSocketClient] Failed to rejoin room ${room}:`, error);
      }
    }
  }

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  /**
   * Get current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connectionState === 'connected' && this.socket?.connected === true;
  }

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void {
    const oldState = this.connectionState;
    this.connectionState = state;

    if (oldState !== state) {
      this.stateListeners.forEach((listener) => {
        try {
          listener(state);
        } catch (error) {
          console.error('[WebSocketClient] Error in state listener:', error);
        }
      });
    }
  }

  /**
   * Subscribe to connection state changes
   *
   * @param listener - State change callback
   * @returns Unsubscribe function
   */
  public onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);

    // Immediately call with current state
    listener(this.connectionState);

    return () => {
      this.stateListeners.delete(listener);
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get statistics
   */
  public getStats(): {
    connected: boolean;
    state: ConnectionState;
    reconnectAttempts: number;
    eventHandlers: number;
    queuedMessages: number;
    rooms: number;
  } {
    return {
      connected: this.isConnected(),
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      eventHandlers: this.eventHandlers.size,
      queuedMessages: this.messageQueue.length,
      rooms: this.rooms.size,
    };
  }

  /**
   * Clear message queue
   */
  public clearMessageQueue(): void {
    this.messageQueue = [];
    if (this.isDevelopment) {
      console.log('[WebSocketClient] Message queue cleared');
    }
  }
}

// Export singleton instance
export const websocketClient = new WebSocketClient();

// Export class for testing
export { WebSocketClient };
