/**
 * @module services/collaboration/types
 * @category Services - Collaboration
 * @description Type definitions for real-time collaboration features
 */

/**
 * User presence information
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userColor: string; // For cursor and highlights
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  lastActivity: Date;
  currentDocument?: string;
  currentSelection?: {
    start: number;
    end: number;
  };
}

/**
 * Cursor position
 */
export interface CursorPosition {
  userId: string;
  documentId: string;
  position: {
    line: number;
    column: number;
    x?: number; // Pixel position for visual cursor
    y?: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

/**
 * Collaborative edit operation
 */
export interface CollaborativeEdit {
  id: string;
  userId: string;
  documentId: string;
  timestamp: Date;
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number; // For delete operations
  version: number; // Document version
}

/**
 * Conflict detection result
 */
export interface EditConflict {
  id: string;
  edit1: CollaborativeEdit;
  edit2: CollaborativeEdit;
  type: 'overlap' | 'adjacent' | 'dependent';
  resolutionStrategy: 'last-write-wins' | 'merge' | 'manual';
  merged?: CollaborativeEdit;
}

/**
 * Document lock
 */
export interface DocumentLock {
  documentId: string;
  userId: string;
  userName: string;
  lockedAt: Date;
  expiresAt: Date;
  section?: { start: number; end: number };
}

/**
 * WebSocket message types
 */
export type WSMessageType = 
  | 'presence-update'
  | 'cursor-move'
  | 'edit-operation'
  | 'lock-request'
  | 'lock-release'
  | 'user-joined'
  | 'user-left'
  | 'document-opened'
  | 'document-closed';

/**
 * WebSocket message
 */
export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: Date;
  userId: string;
}

/**
 * Collaboration event types
 */
export type CollaborationEvent = 
  | 'user-joined'
  | 'user-left'
  | 'presence-changed'
  | 'cursor-moved'
  | 'edit-received'
  | 'conflict-detected'
  | 'lock-acquired'
  | 'lock-released'
  | 'connected'
  | 'disconnected'
  | 'error';

/**
 * Collaboration Service Configuration
 */
export interface CollaborationConfig {
  wsUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  idleTimeout?: number; // Milliseconds before marking user as idle
  awayTimeout?: number; // Milliseconds before marking user as away
  lockTimeout?: number; // Milliseconds before auto-releasing lock
}
