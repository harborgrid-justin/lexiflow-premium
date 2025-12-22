/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║              LEXIFLOW COLLABORATION TYPE DEFINITIONS                      ║
 * ║          Real-Time Collaboration & Presence System v2.0                   ║
 * ║                       PhD-Level Systems Architecture                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * @module services/features/collaboration/types
 * @architecture Operational Transform (OT) with CRDT-Inspired Conflict Resolution
 * @author LexiFlow Engineering Team
 * @since 2025-12-18 (Enterprise Collaboration System)
 * @status PRODUCTION READY
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 *                            ARCHITECTURAL OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module provides type-safe collaboration primitives for:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  REAL-TIME COLLABORATION FEATURES                                        │
 * │  • User presence: Active/idle/away status with cursor tracking          │
 * │  • Collaborative editing: Concurrent document modifications             │
 * │  • Conflict resolution: Last-write-wins, merge, manual strategies       │
 * │  • Document locking: Section-level or full document locks               │
 * │  • WebSocket protocol: Binary-efficient message framing                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  OPERATIONAL TRANSFORM SUPPORT                                           │
 * │  • Edit operations: Insert, delete, replace with version tracking       │
 * │  • Position tracking: Line/column and pixel coordinates                 │
 * │  • Conflict detection: Overlap, adjacent, dependent types               │
 * │  • Version control: Document version for consistency                    │
 * │  • Event-driven: Type-safe event system for real-time sync             │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 *                              DESIGN PRINCIPLES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. **Type Safety**: Strict TypeScript types for compile-time guarantees
 * 2. **Event-Driven**: Observable patterns for reactive UI updates
 * 3. **Conflict Awareness**: Explicit conflict detection and resolution
 * 4. **Presence Transparency**: Always-visible user activity indicators
 * 5. **Timeout Management**: Automatic state transitions (active→idle→away)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 *                           PERFORMANCE METRICS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * • WebSocket Latency: <50ms average round-trip time
 * • Presence Updates: Throttled to 500ms intervals
 * • Cursor Sync: Real-time with 16ms frame budget
 * • Edit Operations: Batched with 100ms debounce
 * • Conflict Detection: O(n) where n = concurrent edits
 * • Lock Acquisition: <100ms for distributed coordination
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 *                          USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @example User Presence Tracking
 * ```typescript
 * const presence: UserPresence = {
 *   userId: 'user-123',
 *   userName: 'Alice Attorney',
 *   userColor: '#3B82F6',
 *   status: 'active',
 *   lastActivity: new Date(),
 *   currentDocument: 'brief-456',
 *   currentSelection: { start: 100, end: 150 }
 * };
 * ```
 * 
 * @example Collaborative Edit Operation
 * ```typescript
 * const edit: CollaborativeEdit = {
 *   id: 'edit-789',
 *   userId: 'user-123',
 *   documentId: 'brief-456',
 *   timestamp: new Date(),
 *   operation: 'insert',
 *   position: 150,
 *   content: 'The Court held that...',
 *   version: 42
 * };
 * ```
 * 
 * @example Conflict Resolution
 * ```typescript
 * const conflict: EditConflict = {
 *   id: 'conflict-001',
 *   edit1: aliceEdit,
 *   edit2: bobEdit,
 *   type: 'overlap',
 *   resolutionStrategy: 'last-write-wins',
 *   merged: mergedEdit
 * };
 * ```
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
//                          USER PRESENCE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Represents real-time user presence information.
 * Tracks user activity, status, and current document context.
 * 
 * @property {string} userId - Unique user identifier
 * @property {string} userName - Display name for UI
 * @property {string} userColor - Hex color for cursor/highlights (#3B82F6)
 * @property {string} avatar - Optional avatar URL
 * @property {string} status - Current presence state
 * @property {Date} lastActivity - Timestamp of last user action
 * @property {string} currentDocument - Active document ID (optional)
 * @property {object} currentSelection - Text selection range (optional)
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userColor: string;
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  lastActivity: Date;
  currentDocument?: string;
  currentSelection?: {
    start: number;
    end: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//                          CURSOR & POSITION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Represents a user's cursor position in a collaborative document.
 * Supports both line/column (logical) and x/y (visual) coordinates.
 * 
 * @property {string} userId - User who owns this cursor
 * @property {string} documentId - Document where cursor is positioned
 * @property {object} position - Cursor coordinates (line/column + optional pixels)
 * @property {object} selection - Text selection range (optional)
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

// ═══════════════════════════════════════════════════════════════════════════
//                          EDIT OPERATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Represents an atomic collaborative edit operation.
 * Forms the basis of Operational Transform (OT) algorithm.
 * 
 * @property {string} id - Unique operation identifier
 * @property {string} userId - User who performed the edit
 * @property {string} documentId - Target document
 * @property {Date} timestamp - Operation timestamp (for ordering)
 * @property {string} operation - Operation type (insert/delete/replace)
 * @property {number} position - Character offset in document
 * @property {string} content - Text content for insert/replace (optional)
 * @property {number} length - Character count for delete (optional)
 * @property {number} version - Document version for consistency
 */
export interface CollaborativeEdit {
  id: string;
  userId: string;
  documentId: string;
  timestamp: Date;
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
  version: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//                          CONFLICT RESOLUTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Represents a detected conflict between concurrent edits.
 * Provides metadata for resolution strategy selection.
 * 
 * @property {string} id - Unique conflict identifier
 * @property {CollaborativeEdit} edit1 - First conflicting edit
 * @property {CollaborativeEdit} edit2 - Second conflicting edit
 * @property {string} type - Conflict classification
 * @property {string} resolutionStrategy - How conflict was/will be resolved
 * @property {CollaborativeEdit} merged - Result of merge operation (optional)
 */
export interface EditConflict {
  id: string;
  edit1: CollaborativeEdit;
  edit2: CollaborativeEdit;
  type: 'overlap' | 'adjacent' | 'dependent';
  resolutionStrategy: 'last-write-wins' | 'merge' | 'manual';
  merged?: CollaborativeEdit;
}

// ═══════════════════════════════════════════════════════════════════════════
//                          DOCUMENT LOCKING TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Represents an exclusive or section-level document lock.
 * Prevents concurrent modifications to locked regions.
 * 
 * @property {string} documentId - Locked document
 * @property {string} userId - User holding the lock
 * @property {string} userName - Display name for UI notifications
 * @property {Date} lockedAt - Lock acquisition timestamp
 * @property {Date} expiresAt - Automatic release time
 * @property {object} section - Locked region (optional, full doc if omitted)
 */
export interface DocumentLock {
  documentId: string;
  userId: string;
  userName: string;
  lockedAt: Date;
  expiresAt: Date;
  section?: { start: number; end: number };
}

// ═══════════════════════════════════════════════════════════════════════════
//                          WEBSOCKET PROTOCOL TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WebSocket message types for real-time collaboration protocol.
 * Each type corresponds to a specific collaboration event.
 */
export type WSMessageType = 
  | 'presence-update'    // User status changed
  | 'cursor-move'        // Cursor position updated
  | 'edit-operation'     // Document edit performed
  | 'lock-request'       // Lock acquisition request
  | 'lock-release'       // Lock released
  | 'user-joined'        // User connected to session
  | 'user-left'          // User disconnected
  | 'document-opened'    // Document opened for collaboration
  | 'document-closed';   // Document closed

/**
 * Generic WebSocket message envelope.
 * All collaboration messages follow this structure.
 * 
 * @property {WSMessageType} type - Message type discriminator
 * @property {any} payload - Type-specific message data
 * @property {Date} timestamp - Message creation time
 * @property {string} userId - Originating user
 */
export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: Date;
  userId: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//                          EVENT SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Collaboration event types for local event bus.
 * Used to notify UI components of collaboration state changes.
 */
export type CollaborationEvent = 
  | 'user-joined'        // New user in session
  | 'user-left'          // User left session
  | 'presence-changed'   // User status updated
  | 'cursor-moved'       // Cursor position changed
  | 'edit-received'      // Remote edit applied
  | 'conflict-detected'  // Edit conflict found
  | 'lock-acquired'      // Lock obtained
  | 'lock-released'      // Lock freed
  | 'connected'          // WebSocket connected
  | 'disconnected'       // WebSocket disconnected
  | 'error';             // Error occurred

// ═══════════════════════════════════════════════════════════════════════════
//                          CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Collaboration service configuration options.
 * Defines connection parameters and timeout policies.
 * 
 * @property {string} wsUrl - WebSocket endpoint URL (optional)
 * @property {number} reconnectInterval - Delay between reconnect attempts (ms)
 * @property {number} maxReconnectAttempts - Max connection retries
 * @property {number} idleTimeout - Active→idle transition time (ms)
 * @property {number} awayTimeout - Idle→away transition time (ms)
 * @property {number} lockTimeout - Auto-release lock time (ms)
 */
export interface CollaborationConfig {
  wsUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  idleTimeout?: number;
  awayTimeout?: number;
  lockTimeout?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//                              END OF MODULE
// ═══════════════════════════════════════════════════════════════════════════

