/**
 * WebSocket Client - Enhanced Socket.IO Client
 * Provides real-time communication with automatic reconnection and offline queuing
 *
 * NOTE: Requires socket.io-client to be installed:
 * npm install socket.io-client
 */

// Type-only imports for now - will work once socket.io-client is installed
type Socket = any;
type ManagerOptions = any;
type SocketOptions = any;

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

export interface WebSocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
}

export interface QueuedMessage {
  event: string;
  data: any;
  timestamp: number;
  retries: number;
}

type EventCallback = (data: any) => void;
type EventMap = Map<string, Set<EventCallback>>;

/**
 * Enhanced WebSocket Client
 * Provides Socket.IO client with advanced features
 */
export class WebSocketClient {
  private socket: Socket | null = null;
  private config: Required<WebSocketConfig>;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private eventListeners: EventMap = new Map();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private messageQueue: QueuedMessage[] = [];
  private reconnectAttempts: number = 0;
  private maxQueueSize: number = 100;
  private io: any = null; // Will hold socket.io-client

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      autoConnect: config.autoConnect ?? true,
      reconnection: config.reconnection ?? true,
      reconnectionAttempts: config.reconnectionAttempts ?? 5,
      reconnectionDelay: config.reconnectionDelay ?? 1000,
      reconnectionDelayMax: config.reconnectionDelayMax ?? 5000,
      timeout: config.timeout ?? 20000,
    };
  }

  /**
   * Initialize Socket.IO client
   * This will be called when socket.io-client is available
   */
  private async initializeSocketIO(): Promise<any> {
    try {
      // Dynamic import for socket.io-client
      const { io } = await import('socket.io-client');
      return io;
    } catch (error) {
      console.error('[WebSocket] socket.io-client not installed');
      throw new Error(
        'socket.io-client is required. Install with: npm install socket.io-client',
      );
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      // Initialize Socket.IO if not already done
      if (!this.io) {
        this.io = await this.initializeSocketIO();
      }

      // Get auth token
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      // Create socket connection
      this.socket = this.io(this.config.url, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: this.config.reconnection,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        reconnectionDelayMax: this.config.reconnectionDelayMax,
        timeout: this.config.timeout,
      });

      this.setupEventHandlers();

      // Wait for connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, this.config.timeout);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.once('connect_error', (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.setStatus(ConnectionStatus.ERROR);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.setStatus(ConnectionStatus.DISCONNECTING);
      this.socket.disconnect();
      this.socket = null;
      this.setStatus(ConnectionStatus.DISCONNECTED);
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.info('[WebSocket] Connected');
      this.setStatus(ConnectionStatus.CONNECTED);
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[WebSocket] Disconnected:', reason);
      this.setStatus(ConnectionStatus.DISCONNECTED);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.setStatus(ConnectionStatus.ERROR);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.info('[WebSocket] Reconnected after', attemptNumber, 'attempts');
      this.setStatus(ConnectionStatus.CONNECTED);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.info('[WebSocket] Reconnection attempt', attemptNumber);
      this.setStatus(ConnectionStatus.RECONNECTING);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error: Error) => {
      console.error('[WebSocket] Reconnection error:', error.message);
      this.setStatus(ConnectionStatus.ERROR);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
      this.setStatus(ConnectionStatus.DISCONNECTED);
    });

    // Authentication success
    this.socket.on('connection:authenticated', (data: any) => {
      console.info('[WebSocket] Authenticated:', data);
      this.handleEvent('connection:authenticated', data);
    });

    // Catch-all for any event
    this.socket.onAny((event: string, ...args: any[]) => {
      this.handleEvent(event, args[0]);
    });
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Not connected, queuing message:', event);
      this.queueMessage(event, data);
      return;
    }

    try {
      this.socket.emit(event, data);
    } catch (error) {
      console.error('[WebSocket] Failed to emit event:', error);
      this.queueMessage(event, data);
    }
  }

  /**
   * Emit event with acknowledgment
   */
  async emitWithAck<T = any>(event: string, data?: any): Promise<T> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${event} acknowledgment`));
      }, 5000);

      this.socket!.emit(event, data, (response: T) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  /**
   * Subscribe to event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * Subscribe to event once
   */
  once(event: string, callback: EventCallback): void {
    const wrappedCallback: EventCallback = (data) => {
      callback(data);
      this.off(event, wrappedCallback);
    };
    this.on(event, wrappedCallback);
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  /**
   * Get connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED && this.socket?.connected === true;
  }

  /**
   * Get reconnection attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Get queued message count
   */
  getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Handle incoming event
   */
  private handleEvent(event: string, data: any): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in event handler for "${event}":`, error);
        }
      });
    }

    // Trigger wildcard listeners
    const wildcardCallbacks = this.eventListeners.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => {
        try {
          callback({ event, data });
        } catch (error) {
          console.error('[WebSocket] Error in wildcard handler:', error);
        }
      });
    }
  }

  /**
   * Set connection status
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return;

    const oldStatus = this.status;
    this.status = status;

    console.log(`[WebSocket] Status: ${oldStatus} -> ${status}`);

    // Notify listeners
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('[WebSocket] Error in status listener:', error);
      }
    });

    // Emit internal status event
    this.handleEvent('status', { status, previousStatus: oldStatus });
  }

  /**
   * Queue message for later sending
   */
  private queueMessage(event: string, data: any): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      console.warn('[WebSocket] Message queue full, dropping oldest message');
      this.messageQueue.shift();
    }

    this.messageQueue.push({
      event,
      data,
      timestamp: Date.now(),
      retries: 0,
    });
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    console.log(`[WebSocket] Flushing ${this.messageQueue.length} queued messages`);

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.socket?.connected) {
        try {
          this.socket.emit(message.event, message.data);
        } catch (error) {
          console.error('[WebSocket] Failed to send queued message:', error);
          // Re-queue if retries available
          if (message.retries < 3) {
            message.retries++;
            this.messageQueue.push(message);
          }
        }
      }
    }
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.eventListeners.clear();
    this.statusListeners.clear();
    this.messageQueue = [];
  }
}

// Export singleton instance
let websocketClientInstance: WebSocketClient | null = null;

export function getWebSocketClient(config?: WebSocketConfig): WebSocketClient {
  if (!websocketClientInstance && config) {
    websocketClientInstance = new WebSocketClient(config);
  }
  if (!websocketClientInstance) {
    throw new Error('WebSocket client not initialized. Provide config on first call.');
  }
  return websocketClientInstance;
}

// Default configuration
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// Create and export default instance
export const websocketClient = new WebSocketClient({
  url: WS_URL,
  autoConnect: false, // Manual connection for better control
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export default websocketClient;
