/**
 * @module services/infrastructure/collaboration/types
 * @category Types - Collaboration
 * @description Type definitions for real-time collaboration features
 */

// ============================================================================
// USER PRESENCE
// ============================================================================

export interface UserPresence {
  userId: string;
  userName: string;
  userColor: string;
  status: "active" | "idle" | "away" | "offline";
  lastActivity: Date;
  currentDocument?: string;
}

// ============================================================================
// CURSOR & SELECTION
// ============================================================================

export interface CursorPosition {
  userId: string;
  documentId: string;
  position: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

// ============================================================================
// COLLABORATIVE EDITING
// ============================================================================

export interface CollaborativeEdit {
  id: string;
  userId: string;
  documentId: string;
  operation: "insert" | "delete" | "replace";
  position: number;
  content?: string;
  length?: number;
  timestamp: Date;
}

export interface EditConflict {
  id: string;
  edit1: CollaborativeEdit;
  edit2: CollaborativeEdit;
  type: "overlap" | "concurrent" | "ordering";
  resolutionStrategy: "last-write-wins" | "merge" | "manual";
}

// ============================================================================
// DOCUMENT LOCKING
// ============================================================================

export interface DocumentLock {
  documentId: string;
  userId: string;
  userName: string;
  lockedAt: Date;
  expiresAt: Date;
  section?: {
    start: number;
    end: number;
  };
}

// ============================================================================
// WEBSOCKET MESSAGES
// ============================================================================

export type WSMessageType =
  | "presence-update"
  | "cursor-move"
  | "edit-operation"
  | "lock-request"
  | "lock-release"
  | "user-joined"
  | "user-left"
  | "sync-request"
  | "sync-response";

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp: Date;
  userId: string;
}

// ============================================================================
// EVENTS
// ============================================================================

export type CollaborationEvent =
  | "connected"
  | "disconnected"
  | "error"
  | "presence-changed"
  | "cursor-moved"
  | "edit-received"
  | "conflict-detected"
  | "lock-acquired"
  | "lock-released"
  | "user-joined"
  | "user-left";

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface CollaborationConfig {
  wsUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  idleTimeout?: number;
  awayTimeout?: number;
  lockTimeout?: number;
}
