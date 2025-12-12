import { io, Socket } from 'socket.io-client';

/**
 * WebSocket Service
 *
 * Manages WebSocket connections for real-time communication
 * Provides connection management, event handling, and reconnection logic
 */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WebSocketConfig {
  url: string;
  namespace?: string;
  auth?: {
    token?: string;
    userId?: string;
  };
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private status: ConnectionStatus = 'disconnected';
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private eventHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.setStatus('connecting');

    const url = this.config.namespace
      ? `${this.config.url}${this.config.namespace}`
      : this.config.url;

    this.socket = io(url, {
      auth: this.config.auth || {},
      transports: ['websocket', 'polling'],
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
    });

    this.setupDefaultHandlers();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setStatus('disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot emit, not connected:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Emit an event and wait for acknowledgment
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
   * Subscribe to an event
   */
  on(event: string, handler: (...args: any[]) => void): () => void {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot subscribe, socket not initialized:', event);
      return () => {};
    }

    // Store handler for cleanup
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Subscribe to socket event
    this.socket.on(event, handler);

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler?: (...args: any[]) => void): void {
    if (!this.socket) return;

    if (handler) {
      this.socket.off(event, handler);
      this.eventHandlers.get(event)?.delete(handler);
    } else {
      this.socket.off(event);
      this.eventHandlers.delete(event);
    }
  }

  /**
   * Subscribe to an event once
   */
  once(event: string, handler: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot subscribe, socket not initialized:', event);
      return;
    }

    this.socket.once(event, handler);
  }

  /**
   * Setup default event handlers
   */
  private setupDefaultHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.setStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.setStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.setStatus('error');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
      this.setStatus('connected');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[WebSocket] Reconnection attempt', attemptNumber);
      this.setStatus('connecting');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[WebSocket] Reconnection error:', error.message);
      this.setStatus('error');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
      this.setStatus('disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      this.setStatus('error');
    });

    // Authentication success
    this.socket.on('connection:authenticated', (data) => {
      console.log('[WebSocket] Authenticated:', data);
    });
  }

  /**
   * Set connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return;

    this.status = status;
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('[WebSocket] Error in status listener:', error);
      }
    });
  }

  /**
   * Clean up all event handlers
   */
  cleanup(): void {
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.off(event, handler);
      });
    });

    this.eventHandlers.clear();
    this.statusListeners.clear();
  }
}

/**
 * WebSocket Manager
 *
 * Singleton manager for multiple WebSocket connections
 */
class WebSocketManager {
  private connections: Map<string, WebSocketService> = new Map();

  /**
   * Create or get a WebSocket connection
   */
  getConnection(name: string, config?: WebSocketConfig): WebSocketService {
    if (!this.connections.has(name)) {
      if (!config) {
        throw new Error(`WebSocket connection "${name}" not found and no config provided`);
      }
      this.connections.set(name, new WebSocketService(config));
    }

    return this.connections.get(name)!;
  }

  /**
   * Check if connection exists
   */
  hasConnection(name: string): boolean {
    return this.connections.has(name);
  }

  /**
   * Remove a connection
   */
  removeConnection(name: string): void {
    const connection = this.connections.get(name);
    if (connection) {
      connection.disconnect();
      connection.cleanup();
      this.connections.delete(name);
    }
  }

  /**
   * Disconnect all connections
   */
  disconnectAll(): void {
    this.connections.forEach((connection) => {
      connection.disconnect();
      connection.cleanup();
    });
    this.connections.clear();
  }

  /**
   * Get all connection names
   */
  getConnectionNames(): string[] {
    return Array.from(this.connections.keys());
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager();

// Export default WebSocket service for main connection
export default WebSocketService;
