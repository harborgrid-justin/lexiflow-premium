/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                  BACKEND SESSION SERVICE                                  ║
 * ║           Session Service with Backend Sync                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/session/backend-session.service
 * @description Session service with backend synchronization
 *
 * FEATURES:
 * - Backend session persistence
 * - Multi-device session sync
 * - Session expiry tracking
 * - Activity monitoring
 */

import { ServiceError } from '../core/BaseService';
import { apiClient } from '../infrastructure/api-client.service';
import { BackendSyncService, SyncResult, TimerManager } from '../core/factories';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionData {
  id: string;
  userId: string;
  data: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  lastActivity: string;
}

export interface SessionValue {
  value: string;
  timestamp: number;
}

/**
 * Backend session configuration
 */
export interface BackendSessionConfig {
  /** API endpoint for sessions */
  endpoint?: string;
  /** Enable auto-sync */
  autoSync?: boolean;
  /** Sync interval in ms */
  syncInterval?: number;
  /** Session TTL in ms */
  sessionTTL?: number;
}

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Session service with backend synchronization.
 * 
 * Extends BackendSyncService with session-specific functionality.
 * Enables cross-device session restoration.
 */
export class BackendSessionService extends BackendSyncService<SessionValue> {
  private sessionId: string | null = null;
  private readonly activityTimers = new TimerManager();
  
  private override config: BackendSessionConfig = {
    endpoint: '/api/sessions',
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    sessionTTL: 86400000 // 24 hours
  };

  constructor(config?: BackendSessionConfig) {
    super('BackendSessionService', {
      autoSyncInterval: config?.syncInterval ?? 30000,
      debounceDelay: 500,
    });
    
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  protected override async onStart(): Promise<void> {
    // Get or create session
    this.sessionId = sessionStorage.getItem('__session_id') || null;
    
    if (!this.sessionId) {
      await this.createSession();
    } else {
      await this.restoreSession();
    }

    // Track activity
    this.setupActivityTracking();
  }

  /**
   * Implement BackendSyncService abstract method
   */
  protected async syncToBackend(key: string, value: SessionValue): Promise<SyncResult<SessionValue>> {
    if (!this.sessionId) {
      return { success: false, error: new Error('No session ID') };
    }

    try {
      await apiClient.put(`${this.config.endpoint}/${this.sessionId}`, {
        items: [{
          key,
          value: value.value === '__DELETED__' ? null : value.value,
          timestamp: value.timestamp
        }]
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Implement BackendSyncService abstract method
   */
  protected async fetchFromBackend(key: string): Promise<SessionValue | undefined> {
    if (!this.sessionId) {
      return undefined;
    }

    try {
      const response = await apiClient.get<SessionData>(
        `${this.config.endpoint}/${this.sessionId}`
      );

      const value = response.data[key];
      if (value) {
        return {
          value,
          timestamp: new Date(response.updatedAt).getTime()
        };
      }
      return undefined;
    } catch (error) {
      this.error(`Failed to fetch ${key} from backend:`, error);
      return undefined;
    }
  }

  /**
   * Set session item
   */
  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
    
    // Skip internal keys for sync
    if (!key.startsWith('__')) {
      this.queueSync(key, { value, timestamp: Date.now() });
    }
  }

  /**
   * Get session item
   */
  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  /**
   * Remove session item
   */
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
    
    // Skip internal keys for sync
    if (!key.startsWith('__')) {
      this.queueSync(key, { value: '__DELETED__', timestamp: Date.now() });
    }
  }

  /**
   * Clear session
   */
  clear(): void {
    const keys = this.getAllKeys();
    sessionStorage.clear();
    
    // Add all keys as deleted to sync queue
    keys.forEach(key => {
      this.queueSync(key, { value: '__DELETED__', timestamp: Date.now() });
    });
  }

  /**
   * Create new session on backend
   */
  async createSession(): Promise<void> {
    try {
      const response = await apiClient.post<SessionData>(
        this.config.endpoint!,
        {
          ttl: this.config.sessionTTL
        }
      );

      this.sessionId = response.id;
      sessionStorage.setItem('__session_id', this.sessionId);
      
      this.log(`Created session: ${this.sessionId}`);
      
    } catch (error) {
      this.error('Failed to create session:', error);
      throw new ServiceError('BackendSessionService', 'Failed to create session');
    }
  }

  /**
   * Restore session from backend
   */
  async restoreSession(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      const response = await apiClient.get<SessionData>(
        `${this.config.endpoint}/${this.sessionId}`
      );

      // Restore session data
      Object.entries(response.data).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
      });

      this.log(`Restored session: ${this.sessionId}`);
      
    } catch (error) {
      this.error('Failed to restore session:', error);
      // Create new session on restore failure
      await this.createSession();
    }
  }

  /**
   * Destroy session
   */
  async destroySession(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      await apiClient.delete(`${this.config.endpoint}/${this.sessionId}`);
      
      sessionStorage.clear();
      this.sessionId = null;
      
      this.log('Session destroyed');
      
    } catch (error) {
      this.error('Failed to destroy session:', error);
    }
  }

  /**
   * Update session activity
   */
  async updateActivity(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      await apiClient.post(
        `${this.config.endpoint}/${this.sessionId}/activity`,
        {
          timestamp: Date.now()
        }
      );
      
    } catch (error) {
      this.error('Failed to update activity:', error);
    }
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Get all storage keys
   */
  private getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && !key.startsWith('__')) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Setup activity tracking
   */
  private setupActivityTracking(): void {
    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      this.activityTimers.setTimeout(() => {
        this.updateActivity().catch((error) => {
          this.error('Failed to update activity:', error);
        });
      }, 5000); // Debounce activity updates
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
  }
}
