import { WebSocketService } from './websocketService';

export interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  position: {
    x: number;
    y: number;
    line?: number;
    column?: number;
    elementId?: string;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  timestamp: Date;
  isIdle?: boolean;
}

export interface DocumentChange {
  userId: string;
  userName: string;
  documentId: string;
  timestamp: Date;
  operations: any[];
  version: number;
}

export interface CollaborationSession {
  sessionId: string;
  documentId: string;
  participants: string[];
  cursors: CursorPosition[];
  version: number;
}

export class CollaborationService {
  private ws: WebSocketService;
  private currentSession: CollaborationSession | null = null;
  private sessionListeners = new Set<(session: CollaborationSession) => void>();
  private cursorListeners = new Set<(cursors: CursorPosition[]) => void>();
  private changeListeners = new Set<(change: DocumentChange) => void>();
  private participantListeners = new Set<(participants: string[]) => void>();

  constructor(ws: WebSocketService) {
    this.ws = ws;
    this.setupListeners();
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupListeners(): void {
    // Session joined
    this.ws.on('collaboration:joined', (data: CollaborationSession) => {
      this.currentSession = data;
      this.notifySessionListeners(data);
      this.notifyCursorListeners(data.cursors);
      this.notifyParticipantListeners(data.participants);
    });

    // Participant joined
    this.ws.on(
      'collaboration:participant:joined',
      (data: { sessionId: string; userId: string; userName: string; participants: string[] }) => {
        if (this.currentSession) {
          this.currentSession.participants = data.participants;
          this.notifyParticipantListeners(data.participants);
        }
      },
    );

    // Participant left
    this.ws.on(
      'collaboration:participant:left',
      (data: { sessionId: string; userId: string; participants: string[] }) => {
        if (this.currentSession) {
          this.currentSession.participants = data.participants;
          this.notifyParticipantListeners(data.participants);
          // Remove cursor for left participant
          if (this.currentSession.cursors) {
            this.currentSession.cursors = this.currentSession.cursors.filter(
              (c) => c.userId !== data.userId,
            );
            this.notifyCursorListeners(this.currentSession.cursors);
          }
        }
      },
    );

    // Cursor update
    this.ws.on('collaboration:cursor:update', (cursor: CursorPosition) => {
      if (this.currentSession) {
        // Update or add cursor
        const existingIndex = this.currentSession.cursors.findIndex(
          (c) => c.userId === cursor.userId,
        );
        if (existingIndex >= 0) {
          this.currentSession.cursors[existingIndex] = {
            ...cursor,
            timestamp: new Date(cursor.timestamp),
          };
        } else {
          this.currentSession.cursors.push({
            ...cursor,
            timestamp: new Date(cursor.timestamp),
          });
        }
        this.notifyCursorListeners(this.currentSession.cursors);
      }
    });

    // Cursor removed
    this.ws.on('cursor:removed', (data: { documentId: string; userId: string }) => {
      if (this.currentSession) {
        this.currentSession.cursors = this.currentSession.cursors.filter(
          (c) => c.userId !== data.userId,
        );
        this.notifyCursorListeners(this.currentSession.cursors);
      }
    });

    // Document change apply
    this.ws.on('collaboration:change:apply', (change: DocumentChange) => {
      const parsedChange = {
        ...change,
        timestamp: new Date(change.timestamp),
      };
      this.notifyChangeListeners(parsedChange);

      if (this.currentSession) {
        this.currentSession.version = change.version;
      }
    });

    // Change acknowledgment
    this.ws.on('collaboration:change:ack', (data: { documentId: string; version: number }) => {
      if (this.currentSession) {
        this.currentSession.version = data.version;
      }
    });

    // Version conflict
    this.ws.on(
      'collaboration:version:conflict',
      (data: { documentId: string; expectedVersion: number; currentVersion: number }) => {
        console.warn('[CollaborationService] Version conflict:', data);
        // Notify about conflict - application should handle re-sync
      },
    );

    // Lock acquired
    this.ws.on('collaboration:lock:acquired', (lock: any) => {
      console.log('[CollaborationService] Lock acquired:', lock);
    });

    // Lock denied
    this.ws.on('collaboration:lock:denied', (data: any) => {
      console.warn('[CollaborationService] Lock denied:', data);
    });

    // Lock released
    this.ws.on(
      'collaboration:lock:released',
      (data: { documentId: string; sectionId?: string }) => {
        console.log('[CollaborationService] Lock released:', data);
      },
    );
  }

  /**
   * Join collaboration session
   */
  async joinSession(documentId: string): Promise<void> {
    this.ws.emit('collaboration:join', { documentId });

    // Wait for joined confirmation
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Join session timeout'));
      }, 5000);

      const unsubscribe = this.ws.once('collaboration:joined', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  /**
   * Leave collaboration session
   */
  leaveSession(documentId: string): void {
    this.ws.emit('collaboration:leave', { documentId });
    this.currentSession = null;
  }

  /**
   * Update cursor position
   */
  updateCursor(
    documentId: string,
    position: {
      x: number;
      y: number;
      line?: number;
      column?: number;
      elementId?: string;
    },
    selection?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    },
    color: string,
  ): void {
    this.ws.emit('collaboration:cursor', {
      documentId,
      position,
      selection,
      color,
    });
  }

  /**
   * Send document change
   */
  sendChange(
    documentId: string,
    operations: any[],
    version: number,
  ): void {
    this.ws.emit('collaboration:change', {
      documentId,
      operations,
      version,
    });
  }

  /**
   * Acquire lock
   */
  async acquireLock(
    documentId: string,
    sectionId?: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const onSuccess = () => {
        this.ws.off('collaboration:lock:success', onSuccess);
        this.ws.off('collaboration:lock:denied', onDenied);
        clearTimeout(timeout);
        resolve(true);
      };

      const onDenied = () => {
        this.ws.off('collaboration:lock:success', onSuccess);
        this.ws.off('collaboration:lock:denied', onDenied);
        clearTimeout(timeout);
        resolve(false);
      };

      const timeout = setTimeout(() => {
        this.ws.off('collaboration:lock:success', onSuccess);
        this.ws.off('collaboration:lock:denied', onDenied);
        resolve(false);
      }, 5000);

      this.ws.once('collaboration:lock:success', onSuccess);
      this.ws.once('collaboration:lock:denied', onDenied);

      this.ws.emit('collaboration:lock:acquire', { documentId, sectionId });
    });
  }

  /**
   * Release lock
   */
  releaseLock(documentId: string, sectionId?: string): void {
    this.ws.emit('collaboration:lock:release', { documentId, sectionId });
  }

  /**
   * Get current session
   */
  getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  /**
   * Get current cursors
   */
  getCurrentCursors(): CursorPosition[] {
    return this.currentSession?.cursors || [];
  }

  /**
   * Get current participants
   */
  getCurrentParticipants(): string[] {
    return this.currentSession?.participants || [];
  }

  /**
   * Subscribe to session changes
   */
  onSessionChange(listener: (session: CollaborationSession) => void): () => void {
    this.sessionListeners.add(listener);

    // Call immediately with current state if available
    if (this.currentSession) {
      listener(this.currentSession);
    }

    // Return unsubscribe function
    return () => {
      this.sessionListeners.delete(listener);
    };
  }

  /**
   * Subscribe to cursor updates
   */
  onCursorUpdate(listener: (cursors: CursorPosition[]) => void): () => void {
    this.cursorListeners.add(listener);

    // Call immediately with current cursors
    if (this.currentSession) {
      listener(this.currentSession.cursors);
    }

    // Return unsubscribe function
    return () => {
      this.cursorListeners.delete(listener);
    };
  }

  /**
   * Subscribe to document changes
   */
  onDocumentChange(listener: (change: DocumentChange) => void): () => void {
    this.changeListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /**
   * Subscribe to participant changes
   */
  onParticipantsChange(listener: (participants: string[]) => void): () => void {
    this.participantListeners.add(listener);

    // Call immediately with current participants
    if (this.currentSession) {
      listener(this.currentSession.participants);
    }

    // Return unsubscribe function
    return () => {
      this.participantListeners.delete(listener);
    };
  }

  /**
   * Notify session listeners
   */
  private notifySessionListeners(session: CollaborationSession): void {
    this.sessionListeners.forEach((listener) => {
      try {
        listener(session);
      } catch (error) {
        console.error('[CollaborationService] Error in session listener:', error);
      }
    });
  }

  /**
   * Notify cursor listeners
   */
  private notifyCursorListeners(cursors: CursorPosition[]): void {
    this.cursorListeners.forEach((listener) => {
      try {
        listener(cursors);
      } catch (error) {
        console.error('[CollaborationService] Error in cursor listener:', error);
      }
    });
  }

  /**
   * Notify change listeners
   */
  private notifyChangeListeners(change: DocumentChange): void {
    this.changeListeners.forEach((listener) => {
      try {
        listener(change);
      } catch (error) {
        console.error('[CollaborationService] Error in change listener:', error);
      }
    });
  }

  /**
   * Notify participant listeners
   */
  private notifyParticipantListeners(participants: string[]): void {
    this.participantListeners.forEach((listener) => {
      try {
        listener(participants);
      } catch (error) {
        console.error('[CollaborationService] Error in participant listener:', error);
      }
    });
  }

  /**
   * Clean up
   */
  cleanup(): void {
    if (this.currentSession) {
      this.leaveSession(this.currentSession.documentId);
    }
    this.sessionListeners.clear();
    this.cursorListeners.clear();
    this.changeListeners.clear();
    this.participantListeners.clear();
  }
}

export default CollaborationService;
