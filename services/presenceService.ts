import { WebSocketService } from './websocketService';

export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export interface PresenceData {
  userId: string;
  status: PresenceStatus;
  lastSeen: Date;
  currentPage?: string;
  customStatus?: string;
}

export interface PresenceUpdate {
  status: PresenceStatus;
  customStatus?: string;
  currentPage?: string;
}

export class PresenceService {
  private ws: WebSocketService;
  private presenceMap = new Map<string, PresenceData>();
  private listeners = new Set<(presences: PresenceData[]) => void>();
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(ws: WebSocketService) {
    this.ws = ws;
    this.setupListeners();
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupListeners(): void {
    // Initial presence state
    this.ws.on('presence:initial', (presences: PresenceData[]) => {
      presences.forEach((presence) => {
        this.presenceMap.set(presence.userId, {
          ...presence,
          lastSeen: new Date(presence.lastSeen),
        });
      });
      this.notifyListeners();
    });

    // Presence updates
    this.ws.on('presence:update', (presence: PresenceData) => {
      this.presenceMap.set(presence.userId, {
        ...presence,
        lastSeen: new Date(presence.lastSeen),
      });
      this.notifyListeners();
    });

    // Presence changed
    this.ws.on('presence:changed', (presence: PresenceData) => {
      this.presenceMap.set(presence.userId, {
        ...presence,
        lastSeen: new Date(presence.lastSeen),
      });
      this.notifyListeners();
    });

    // Heartbeat ping
    this.ws.on('presence:ping', () => {
      this.ws.emit('presence:heartbeat');
    });
  }

  /**
   * Start presence tracking
   */
  start(): void {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.ws.isConnected()) {
        this.ws.emit('presence:heartbeat');
      }
    }, 30000);
  }

  /**
   * Stop presence tracking
   */
  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Update presence status
   */
  updatePresence(update: PresenceUpdate): void {
    this.ws.emit('presence:update', update);
  }

  /**
   * Subscribe to specific users' presence
   */
  subscribeToUsers(userIds: string[]): void {
    this.ws.emit('presence:subscribe', userIds);

    this.ws.once('presence:subscribed', (presences: PresenceData[]) => {
      presences.forEach((presence) => {
        this.presenceMap.set(presence.userId, {
          ...presence,
          lastSeen: new Date(presence.lastSeen),
        });
      });
      this.notifyListeners();
    });
  }

  /**
   * Unsubscribe from specific users' presence
   */
  unsubscribeFromUsers(userIds: string[]): void {
    this.ws.emit('presence:unsubscribe', userIds);
    userIds.forEach((userId) => {
      this.presenceMap.delete(userId);
    });
    this.notifyListeners();
  }

  /**
   * Query presence for specific users
   */
  async queryPresence(userIds: string[]): Promise<PresenceData[]> {
    return new Promise((resolve) => {
      this.ws.once('presence:result', (presences: PresenceData[]) => {
        resolve(
          presences.map((p) => ({
            ...p,
            lastSeen: new Date(p.lastSeen),
          })),
        );
      });

      this.ws.emit('presence:query', userIds);
    });
  }

  /**
   * Get presence for a specific user
   */
  getPresence(userId: string): PresenceData | undefined {
    return this.presenceMap.get(userId);
  }

  /**
   * Get all presences
   */
  getAllPresences(): PresenceData[] {
    return Array.from(this.presenceMap.values());
  }

  /**
   * Get online users
   */
  getOnlineUsers(): PresenceData[] {
    return Array.from(this.presenceMap.values()).filter(
      (p) => p.status !== PresenceStatus.OFFLINE,
    );
  }

  /**
   * Subscribe to presence changes
   */
  onPresenceChange(listener: (presences: PresenceData[]) => void): () => void {
    this.listeners.add(listener);

    // Call immediately with current state
    listener(this.getAllPresences());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const presences = this.getAllPresences();
    this.listeners.forEach((listener) => {
      try {
        listener(presences);
      } catch (error) {
        console.error('[PresenceService] Error in listener:', error);
      }
    });
  }

  /**
   * Clean up
   */
  cleanup(): void {
    this.stop();
    this.presenceMap.clear();
    this.listeners.clear();
  }
}

export default PresenceService;
