/**
 * @module useModal
 * @description Enterprise-grade React hook for modal state management with typed data payloads
 * 
 * Provides production-ready modal management with:
 * - Type-safe data payload support (generic T)
 * - Stable callback references via useCallback
 * - Automatic data cleanup on close
 * - Optional data passing on open
 * - Controlled state management
 * 
 * @architecture
 * - Pattern: React Hooks + Controlled State
 * - State: isOpen (boolean) + data (T | null)
 * - Callbacks: Memoized via useCallback for performance
 * - Data lifecycle: Set on open, cleared on close
 * 
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (isOpen, data) + declarative actions (open, close)
 * - NOT action-oriented: Consumers get state snapshot + controls
 * - Data descriptor: Provides payload alongside modal state
 * 
 * STABLE CONTRACT (G43):
 * - Public API: { isOpen, open, close, data }
 * - Implementation can switch from useState to useReducer without breaking consumers
 * - Referential stability: Callbacks memoized for prop identity
 * 
 * SEMANTIC MEMOIZATION (G53):
 * - useCallback ensures open/close are referentially stable
 * - NOT for micro-optimization: prevents child re-renders when passed as props
 * - Semantic intent: Modal component shouldn't re-render on parent re-render
 * 
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Data persists: Until modal closes (explicit close() call)
 * - Data resets: Automatically on close (prevents stale payloads)
 * - Modal state: Controlled, can be opened/closed independently of data
 * 
 * FAIL-FAST GUARDS (G54):
 * - Runtime validation in development mode
 * - Type safety via TypeScript generics
 * 
 * @performance
 * - Callback stability: useCallback prevents re-renders of child components
 * - State updates: Batched by React (open + setData = single render)
 * - Memory: O(1) - two state values
 * 
 * @benefits
 * - Type-safe data payloads (TypeScript generic)
 * - Prevents unnecessary re-renders (stable callbacks)
 * - Automatic data cleanup prevents stale state
 * - Flexible: works with any modal component
 * 
 * @security
 * - Data validated via TypeScript types
 * - No XSS risk (data handling is external)
 * - State isolation per hook instance
 * 
 * @usage
 * ```typescript
 * // Simple modal
 * const modal = useModal();
 * <Modal isOpen={modal.isOpen} onClose={modal.close} />
 * 
 * // Modal with typed data
 * interface EditData { id: string; name: string; }
 * const editModal = useModal<EditData>();
 * 
 * // Open with data
 * editModal.open({ id: '123', name: 'John' });
 * 
 * // Access data in modal
 * {editModal.data && (
 *   <EditForm
 *     initialData={editModal.data}
 *     onSave={handleSave}
 *   />
 * )}
 * 
 * // Confirmation dialog
 * const confirmModal = useModal<{ itemId: string; itemName: string }>();
 * confirmModal.open({ itemId: '123', itemName: 'Document.pdf' });
 * ```
 * 
 * @created 2024-06-15
 * @modified 2025-01-12
 */

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================
import { useState, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Return type for useModal hook
 * @template T - Type of data payload (default: unknown)
 */
export interface UseModalReturn<T = unknown> {
  /** Whether modal is currently open */
  isOpen: boolean;
  /** Open modal with optional data payload */
  open: (modalData?: T) => void;
  /** Close modal and clear data */
  close: () => void;
  /** Current data payload (null when closed) */
  data: T | null;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate initialState parameter
 * @private
 */
function validateInitialState(initialState: unknown): void {
  if (typeof initialState !== 'boolean') {
    throw new Error('[useModal] initialState must be a boolean');
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * React hook for managing modal state with typed data payloads
 * 
 * @template T - Type of data associated with the modal
 * @param initialState - Initial open state (default: false)
 * @returns Object with modal state and control methods
 * @throws Error if initialState is not a boolean
 * 
 * @example
 * // Basic modal
 * const { isOpen, open, close } = useModal();
 * 
 * @example
 * // Edit modal with user data
 * interface User { id: string; name: string; email: string; }
 * const editModal = useModal<User>();
 * 
 * // Open with user data
 * <button onClick={() => editModal.open(user)}>Edit</button>
 * 
 * // Render modal
 * <Modal isOpen={editModal.isOpen} onClose={editModal.close}>
 *   {editModal.data && (
 *     <UserEditForm user={editModal.data} />
 *   )}
 * </Modal>
 * 
 * @example
 * // Delete confirmation
 * const deleteModal = useModal<{ id: string; name: string }>();
 * 
 * <ConfirmDialog
 *   isOpen={deleteModal.isOpen}
 *   onClose={deleteModal.close}
 *   onConfirm={() => handleDelete(deleteModal.data?.id)}
 *   message={`Delete ${deleteModal.data?.name}?`}
 * />
 * 
 * @algorithm
 * 1. Initialize state: isOpen (boolean), data (T | null)
 * 2. open(data?): Set data if provided, then set isOpen = true
 * 3. close(): Set isOpen = false, clear data to null
 * 4. setData: Manual data setter (advanced use cases)
 * 
 * @performance
 * - Callbacks memoized with useCallback (stable references)
 * - State updates batched by React
 * - No unnecessary re-renders in parent components
 * 
 * @cleanup
 * - Data automatically cleared on close (prevents stale state)
 * - No manual cleanup needed (React handles unmount)
 */
export function useModal<T = unknown>(initialState: boolean = false): UseModalReturn<T> {
  // G54 (FAIL-FAST): Validate inputs in development
  if (process.env.NODE_ENV !== 'production') {
    validateInitialState(initialState);
  }

  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  /**
   * Open modal with optional data payload
   * 
   * G53 (SEMANTIC MEMOIZATION): useCallback for referential stability,
   * not micro-optimization. Prevents child re-renders when passed as prop.
   * 
   * G49 (IDEMPOTENCY): Safe under re-execution, no side effect accumulation
   * 
   * @param modalData - Optional data to associate with modal
   * 
   * @example
   * modal.open(); // Open without data
   * modal.open({ userId: '123' }); // Open with data
   */
  const open = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
    // EMPTY DEPS (G46): No external dependencies, always stable
  }, []);

  /**
   * Close modal and clear associated data
   * Prevents stale data from persisting after close
   * 
   * G53 (SEMANTIC MEMOIZATION): Stable reference for prop passing
   * G58 (LIFECYCLE): Data cleared on close (explicit cleanup)
   * 
   * @example
   * modal.close();
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    // EMPTY DEPS (G46): No external dependencies, always stable
  }, []);

  return { isOpen, open, close, data };
}
