/**
 * @module services/collaborationService
 * @category Services
 * @description Real-time collaboration with live cursors, presence indicators, and conflict resolution.
 */

import { EventEmitter } from 'events';
import { WS_URL, WS_RECONNECT_DELAY_MS, WS_RECONNECT_ATTEMPTS } from '../../config/master.config';

// Memory Management: Max pending edits before eviction
const MAX_PENDING_EDITS = 1000;

// Import types from separate file
export * from './collaboration/types';
import type {
  UserPresence,
  CursorPosition,
  CollaborativeEdit,
  EditConflict,
  DocumentLock,
  WSMessageType,
  WSMessage,
  CollaborationEvent,
  CollaborationConfig
} from './collaboration/types';

/**
 * Real-Time Collaboration Service
 */
export class CollaborationService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<CollaborationConfig>;
  private currentUserId: string;
  private currentUserName: string;
  private presenceMap = new Map<string, UserPresence>();
  private cursorMap = new Map<string, CursorPosition>();
  private locks = new Map<string, DocumentLock>();
  private pendingEdits: CollaborativeEdit[] = [];
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(
    userId: string,
    userName: string,
    config: CollaborationConfig = {}
  ) {
    super();
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.config = {
      wsUrl: config.wsUrl ?? WS_URL,
      reconnectInterval: config.reconnectInterval ?? WS_RECONNECT_DELAY_MS,
      maxReconnectAttempts: config.maxReconnectAttempts ?? WS_RECONNECT_ATTEMPTS,
      idleTimeout: config.idleTimeout ?? 60000, // 1 minute
      awayTimeout: config.awayTimeout ?? 300000, // 5 minutes
      lockTimeout: config.lockTimeout ?? 600000 // 10 minutes
    };

    this.startActivityMonitoring();
  }

  /**
   * Connect to collaboration server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          
          // Send initial presence
          this.broadcastPresence('active');
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    // Memory Management: Clean up WebSocket event listeners
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    
    // Clear data structures to release memory
    this.presenceMap.clear();
    this.cursorMap.clear();
    this.locks.clear();
    this.pendingEdits = [];
    
    this.isConnected = false;
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Send message to server
   */
  private send(type: WSMessageType, payload: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, queuing message');
      return;
    }

    const message: WSMessage = {
      type,
      payload,
      timestamp: new Date(),
      userId: this.currentUserId
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'presence-update':
        this.handlePresenceUpdate(message.payload);
        break;
      
      case 'cursor-move':
        this.handleCursorMove(message.payload);
        break;
      
      case 'edit-operation':
        this.handleEditOperation(message.payload);
        break;
      
      case 'lock-request':
        this.handleLockRequest(message.payload);
        break;
      
      case 'lock-release':
        this.handleLockRelease(message.payload);
        break;
      
      case 'user-joined':
        this.handleUserJoined(message.payload);
        break;
      
      case 'user-left':
        this.handleUserLeft(message.payload);
        break;
    }
  }

  /**
   * Broadcast presence update
   */
  broadcastPresence(status: UserPresence['status'], document?: string): void {
    const presence: UserPresence = {
      userId: this.currentUserId,
      userName: this.currentUserName,
      userColor: this.getUserColor(this.currentUserId),
      status,
      lastActivity: new Date(),
      currentDocument: document
    };

    this.presenceMap.set(this.currentUserId, presence);
    this.send('presence-update', presence);
  }

  /**
   * Update cursor position
   */
  updateCursor(documentId: string, position: CursorPosition['position'], selection?: CursorPosition['selection']): void {
    const cursor: CursorPosition = {
      userId: this.currentUserId,
      documentId,
      position,
      selection
    };

    this.cursorMap.set(this.currentUserId, cursor);
    this.send('cursor-move', cursor);
    this.recordActivity();
  }

  /**
   * Send edit operation
   */
  sendEdit(edit: Omit<CollaborativeEdit, 'id' | 'userId' | 'timestamp'>): void {
    const fullEdit: CollaborativeEdit = {
      ...edit,
      id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.currentUserId,
      timestamp: new Date()
    };

    this.pendingEdits.push(fullEdit);
    
    // Memory Management: Enforce size limit with LRU eviction
    if (this.pendingEdits.length > MAX_PENDING_EDITS) {
      const toRemove = Math.floor(MAX_PENDING_EDITS * 0.2); // Remove oldest 20%
      this.pendingEdits.splice(0, toRemove);
      console.warn(`[CollaborationService] Evicted ${toRemove} oldest pending edits`);
    }
    
    this.send('edit-operation', fullEdit);
    this.recordActivity();
  }

  /**
   * Request document lock
   */
  requestLock(documentId: string, section?: { start: number; end: number }): Promise<boolean> {
    return new Promise((resolve) => {
      const lockRequest: Omit<DocumentLock, 'lockedAt' | 'expiresAt'> = {
        documentId,
        userId: this.currentUserId,
        userName: this.currentUserName,
        section
      };

      // Listen for lock response
      const responseHandler = (lock: DocumentLock) => {
        if (lock.documentId === documentId && lock.userId === this.currentUserId) {
          this.off('lock-acquired', responseHandler);
          resolve(true);
        }
      };

      this.on('lock-acquired', responseHandler);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        this.off('lock-acquired', responseHandler);
        resolve(false);
      }, 5000);

      this.send('lock-request', lockRequest);
    });
  }

  /**
   * Release document lock
   */
  releaseLock(documentId: string): void {
    const lock = this.locks.get(documentId);
    if (lock && lock.userId === this.currentUserId) {
      this.locks.delete(documentId);
      this.send('lock-release', { documentId });
      this.emit('lock-released', documentId);
    }
  }

  /**
   * Get all active users
   */
  getActiveUsers(): UserPresence[] {
    return Array.from(this.presenceMap.values())
      .filter(p => p.status === 'active');
  }

  /**
   * Get users viewing a specific document
   */
  getUsersInDocument(documentId: string): UserPresence[] {
    return Array.from(this.presenceMap.values())
      .filter(p => p.currentDocument === documentId);
  }

  /**
   * Get cursor position for a user
   */
  getUserCursor(userId: string): CursorPosition | undefined {
    return this.cursorMap.get(userId);
  }

  /**
   * Check if document is locked
   */
  isDocumentLocked(documentId: string): boolean {
    const lock = this.locks.get(documentId);
    if (!lock) return false;
    
    // Check if lock expired
    if (new Date() > lock.expiresAt) {
      this.locks.delete(documentId);
      return false;
    }
    
    return true;
  }

  /**
   * Get document lock info
   */
  getDocumentLock(documentId: string): DocumentLock | undefined {
    return this.locks.get(documentId);
  }

  /**
   * Detect edit conflicts
   */
  private detectConflicts(newEdit: CollaborativeEdit): EditConflict[] {
    const conflicts: EditConflict[] = [];

    this.pendingEdits.forEach(existingEdit => {
      if (existingEdit.documentId !== newEdit.documentId) return;
      if (existingEdit.userId === newEdit.userId) return;

      // Check for overlapping edits
      const range1 = {
        start: existingEdit.position,
        end: existingEdit.position + (existingEdit.length || existingEdit.content?.length || 0)
      };
      
      const range2 = {
        start: newEdit.position,
        end: newEdit.position + (newEdit.length || newEdit.content?.length || 0)
      };

      if (this.rangesOverlap(range1, range2)) {
        conflicts.push({
          id: `conflict-${Date.now()}`,
          edit1: existingEdit,
          edit2: newEdit,
          type: 'overlap',
          resolutionStrategy: 'last-write-wins'
        });
      }
    });

    return conflicts;
  }

  /**
   * Check if ranges overlap
   */
  private rangesOverlap(r1: { start: number; end: number }, r2: { start: number; end: number }): boolean {
    return r1.start < r2.end && r2.start < r1.end;
  }

  /**
   * Handle presence update
   */
  private handlePresenceUpdate(presence: UserPresence): void {
    this.presenceMap.set(presence.userId, presence);
    this.emit('presence-changed', presence);
  }

  /**
   * Handle cursor move
   */
  private handleCursorMove(cursor: CursorPosition): void {
    this.cursorMap.set(cursor.userId, cursor);
    this.emit('cursor-moved', cursor);
  }

  /**
   * Handle edit operation
   */
  private handleEditOperation(edit: CollaborativeEdit): void {
    // Detect conflicts
    const conflicts = this.detectConflicts(edit);
    
    if (conflicts.length > 0) {
      this.emit('conflict-detected', conflicts);
    }

    this.emit('edit-received', edit);
  }

  /**
   * Handle lock request
   */
  private handleLockRequest(lock: DocumentLock): void {
    this.locks.set(lock.documentId, lock);
    this.emit('lock-acquired', lock);
  }

  /**
   * Handle lock release
   */
  private handleLockRelease(payload: { documentId: string }): void {
    this.locks.delete(payload.documentId);
    this.emit('lock-released', payload.documentId);
  }

  /**
   * Handle user joined
   */
  private handleUserJoined(presence: UserPresence): void {
    this.presenceMap.set(presence.userId, presence);
    this.emit('user-joined', presence);
  }

  /**
   * Handle user left
   */
  private handleUserLeft(payload: { userId: string }): void {
    this.presenceMap.delete(payload.userId);
    this.cursorMap.delete(payload.userId);
    this.emit('user-left', payload.userId);
  }

  /**
   * Generate consistent color for user
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // rose
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316'  // orange
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Record user activity
   */
  private recordActivity(): void {
    const presence = this.presenceMap.get(this.currentUserId);
    if (presence) {
      presence.lastActivity = new Date();
      presence.status = 'active';
      this.broadcastPresence('active', presence.currentDocument);
    }
  }

  /**
   * Start monitoring user activity
   */
  private startActivityMonitoring(): void {
    this.activityTimer = setInterval(() => {
      const presence = this.presenceMap.get(this.currentUserId);
      if (!presence) return;

      const timeSinceActivity = Date.now() - presence.lastActivity.getTime();

      if (timeSinceActivity > this.config.awayTimeout && presence.status !== 'away') {
        this.broadcastPresence('away', presence.currentDocument);
      } else if (timeSinceActivity > this.config.idleTimeout && presence.status === 'active') {
        this.broadcastPresence('idle', presence.currentDocument);
      }
    }, 10000); // Check every 10 seconds
  }
}

// Singleton instance
let serviceInstance: CollaborationService | null = null;

/**
 * Get or create collaboration service
 */
export function getCollaborationService(
  userId?: string,
  userName?: string,
  config?: CollaborationConfig
): CollaborationService {
  if (!serviceInstance && userId && userName) {
    serviceInstance = new CollaborationService(userId, userName, config);
  }
  
  if (!serviceInstance) {
    throw new Error('CollaborationService not initialized. Provide userId and userName.');
  }
  
  return serviceInstance;
}

/**
 * Reset service (for testing)
 */
export function resetCollaborationService(): void {
  if (serviceInstance) {
    serviceInstance.disconnect();
  }
  serviceInstance = null;
}

export default CollaborationService;

