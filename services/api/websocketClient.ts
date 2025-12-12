/**
 * WebSocket Client - Real-time communication
 * Provides Socket.io-like interface for real-time features
 */

type EventCallback = (data: any) => void;
type EventMap = Map<string, Set<EventCallback>>;

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

interface WebSocketClientConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketClientConfig>;
  private eventListeners: EventMap = new Map();
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: Array<{ event: string; data: any }> = [];

  constructor(config: WebSocketClientConfig) {
    this.config = {
      url: config.url,
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      heartbeatInterval: config.heartbeatInterval || 30000,
    };
  }

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.status === ConnectionStatus.CONNECTED) {
        resolve();
        return;
      }

      this.setStatus(ConnectionStatus.CONNECTING);

      try {
        // Add auth token to URL if available
        const token = localStorage.getItem('auth_token');
        const url = token
          ? `${this.config.url}?token=${token}`
          : this.config.url;

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.info('[WebSocket] Connected');
          this.setStatus(ConnectionStatus.CONNECTED);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.setStatus(ConnectionStatus.ERROR);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.warn('[WebSocket] Connection closed:', event.code, event.reason);
          this.setStatus(ConnectionStatus.DISCONNECTED);
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        this.setStatus(ConnectionStatus.ERROR);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();
    this.setStatus(ConnectionStatus.DISCONNECTING);

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  // Send message to server
  emit(event: string, data?: any) {
    const message = { event, data };

    if (this.status !== ConnectionStatus.CONNECTED || !this.ws) {
      // Queue message for later if not connected
      this.messageQueue.push(message);
      console.warn('[WebSocket] Message queued (not connected):', event);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
      this.messageQueue.push(message);
    }
  }

  // Listen for events from server
  on(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  // Remove event listener
  off(event: string, callback?: EventCallback) {
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

  // Listen for event once
  once(event: string, callback: EventCallback) {
    const wrappedCallback: EventCallback = (data) => {
      callback(data);
      this.off(event, wrappedCallback);
    };
    this.on(event, wrappedCallback);
  }

  // Get connection status
  getStatus(): ConnectionStatus {
    return this.status;
  }

  // Check if connected
  isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED;
  }

  // Private methods

  private handleMessage(message: { event: string; data: any }) {
    const { event, data } = message;

    // Handle special events
    if (event === 'pong') {
      return; // Heartbeat response
    }

    // Trigger event listeners
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
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
      wildcardCallbacks.forEach(callback => {
        try {
          callback({ event, data });
        } catch (error) {
          console.error('[WebSocket] Error in wildcard handler:', error);
        }
      });
    }
  }

  private setStatus(status: ConnectionStatus) {
    const oldStatus = this.status;
    this.status = status;

    if (oldStatus !== status) {
      this.handleMessage({
        event: 'status',
        data: { status, previousStatus: oldStatus },
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * this.reconnectAttempts;

    console.info(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.emit('ping');
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.emit(message.event, message.data);
      }
    }
  }
}

// WebSocket endpoint configuration
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// Create and export client instance
export const websocketClient = new WebSocketClient({
  url: WS_URL,
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
});

// Real-time event types for type safety
export const WS_EVENTS = {
  // Case events
  CASE_CREATED: 'case:created',
  CASE_UPDATED: 'case:updated',
  CASE_DELETED: 'case:deleted',

  // Document events
  DOCUMENT_UPLOADED: 'document:uploaded',
  DOCUMENT_UPDATED: 'document:updated',
  DOCUMENT_DELETED: 'document:deleted',

  // Notification events
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification:read',

  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',

  // Collaboration events
  COLLAB_JOIN: 'collab:join',
  COLLAB_LEAVE: 'collab:leave',
  COLLAB_CURSOR: 'collab:cursor',
  COLLAB_CHANGE: 'collab:change',

  // System events
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_MAINTENANCE: 'system:maintenance',
};

// Helper function to initialize WebSocket connection
export const initializeWebSocket = async (): Promise<void> => {
  try {
    await websocketClient.connect();
    console.info('[WebSocket] Initialized successfully');
  } catch (error) {
    console.error('[WebSocket] Initialization failed:', error);
    throw error;
  }
};

// Helper function to cleanup WebSocket connection
export const cleanupWebSocket = (): void => {
  websocketClient.disconnect();
  console.info('[WebSocket] Cleaned up');
};

export default websocketClient;
