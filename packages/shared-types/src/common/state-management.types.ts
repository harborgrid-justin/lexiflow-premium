/**
 * Discriminated Unions for State Management
 * Provides type-safe state machines and UI states
 */

import { ApiError } from '../dto/api-response.dto';

/**
 * Form field validation state
 */
export type FieldValidationState =
  | { status: 'untouched' }
  | { status: 'validating' }
  | { status: 'valid'; message?: string }
  | { status: 'invalid'; errors: string[] };

/**
 * Form state with field-level validation
 */
export interface FormState<TValues extends Record<string, unknown>> {
  values: TValues;
  fields: {
    [K in keyof TValues]?: FieldValidationState;
  };
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
  errors?: Record<string, string[]>;
}

/**
 * Form submission state
 */
export type FormSubmissionState<TResult = unknown> =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'submitting'; progress?: number }
  | { status: 'success'; result: TResult; timestamp: string }
  | { status: 'error'; error: ApiError; timestamp: string };

/**
 * Network request state (for manual control)
 */
export type NetworkState<TData = unknown> =
  | { type: 'idle' }
  | { type: 'fetching'; abortController?: AbortController }
  | { type: 'refetching'; previousData: TData; abortController?: AbortController }
  | { type: 'success'; data: TData; fetchedAt: string; stale: boolean }
  | { type: 'error'; error: ApiError; retryCount: number };

/**
 * Connection state for real-time features
 */
export type ConnectionState =
  | { status: 'disconnected'; reason?: string }
  | { status: 'connecting'; attempt: number }
  | { status: 'connected'; connectedAt: string }
  | { status: 'reconnecting'; attempt: number; lastConnectedAt: string }
  | { status: 'failed'; error: string; attempts: number };

/**
 * Authentication state
 */
export type AuthState<TUser = unknown> =
  | { type: 'unauthenticated' }
  | { type: 'authenticating' }
  | { type: 'authenticated'; user: TUser; token: string; expiresAt: string }
  | { type: 'refreshing'; user: TUser }
  | { type: 'error'; error: ApiError };

/**
 * Type guard for authenticated state
 */
export function isAuthenticated<TUser>(
  state: AuthState<TUser>
): state is { type: 'authenticated'; user: TUser; token: string; expiresAt: string } {
  return state.type === 'authenticated';
}

/**
 * Modal/Dialog state
 */
export type ModalState<TData = unknown> =
  | { isOpen: false }
  | { isOpen: true; mode: 'view'; data: TData }
  | { isOpen: true; mode: 'create' }
  | { isOpen: true; mode: 'edit'; data: TData }
  | { isOpen: true; mode: 'delete'; data: TData }
  | { isOpen: true; mode: 'confirm'; message: string; onConfirm: () => void };

/**
 * Sidebar/Panel state
 */
export type PanelState<TData = unknown> =
  | { isOpen: false }
  | { isOpen: true; content: TData; position: 'left' | 'right'; width?: number };

/**
 * Notification/Toast state
 */
export interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: string;
}

/**
 * Data synchronization state
 */
export type SyncState =
  | { status: 'synced'; lastSyncedAt: string }
  | { status: 'syncing'; progress?: number }
  | { status: 'conflict'; localVersion: unknown; remoteVersion: unknown }
  | { status: 'error'; error: string; lastAttemptAt: string }
  | { status: 'offline'; pendingChanges: number };

/**
 * Permission state
 */
export type PermissionState =
  | { status: 'checking' }
  | { status: 'granted'; permissions: string[] }
  | { status: 'denied'; missingPermissions: string[] }
  | { status: 'error'; error: string };

/**
 * Search state
 */
export type SearchState<TResult = unknown> =
  | { status: 'idle' }
  | { status: 'searching'; query: string }
  | { status: 'success'; query: string; results: TResult[]; total: number; timestamp: string }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: ApiError };

/**
 * Filter state
 */
export interface FilterState<TFilters extends Record<string, unknown> = Record<string, unknown>> {
  active: TFilters;
  available: {
    [K in keyof TFilters]?: Array<TFilters[K]>;
  };
  count: number;
}

/**
 * Sort state
 */
export interface SortState<TField extends string = string> {
  field: TField | null;
  order: 'asc' | 'desc';
}

/**
 * Selection state (for tables, lists, etc.)
 */
export interface SelectionState<TId = string> {
  selectedIds: Set<TId>;
  isAllSelected: boolean;
  excludedIds?: Set<TId>; // For "select all except" scenarios
}

/**
 * Expansion state (for trees, accordions, etc.)
 */
export interface ExpansionState<TId = string> {
  expandedIds: Set<TId>;
  isAllExpanded: boolean;
}

/**
 * Wizard/Stepper state
 */
export interface WizardState<TStepData extends Record<string, unknown> = Record<string, unknown>> {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  stepData: Partial<TStepData>;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isComplete: boolean;
}

/**
 * Editor state
 */
export type EditorState<TContent = string> =
  | { mode: 'view'; content: TContent }
  | { mode: 'edit'; content: TContent; isDirty: boolean; isSaving: boolean }
  | { mode: 'preview'; content: TContent; rendered: string };

/**
 * Drag and drop state
 */
export type DragState<TItem = unknown> =
  | { isDragging: false }
  | {
      isDragging: true;
      item: TItem;
      sourceId: string;
      currentDropTargetId: string | null;
    };

/**
 * Resize state
 */
export interface ResizeState {
  isResizing: boolean;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  currentWidth?: number;
  currentHeight?: number;
}

/**
 * Undo/Redo state
 */
export interface UndoRedoState<TState = unknown> {
  past: TState[];
  present: TState;
  future: TState[];
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Batch operation state
 */
export type BatchOperationState<TItem = unknown, TResult = unknown> =
  | { status: 'idle' }
  | {
      status: 'processing';
      total: number;
      processed: number;
      currentItem: TItem;
      progress: number;
    }
  | {
      status: 'completed';
      total: number;
      succeeded: TResult[];
      failed: Array<{ item: TItem; error: string }>;
      timestamp: string;
    }
  | { status: 'cancelled'; processedCount: number };

/**
 * Feature flag state
 */
export interface FeatureFlagState {
  flags: Record<string, boolean>;
  isLoading: boolean;
  lastUpdated?: string;
}

/**
 * Theme state
 */
export type ThemeState =
  | { mode: 'light' }
  | { mode: 'dark' }
  | { mode: 'auto'; systemPreference: 'light' | 'dark' };

/**
 * Locale/Language state
 */
export interface LocaleState {
  language: string;
  locale: string;
  isLoading: boolean;
  availableLanguages: string[];
}
