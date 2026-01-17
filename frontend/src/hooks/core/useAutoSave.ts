/**
 * @module hooks/useAutoSave
 *
 * Provides automatic data persistence with race condition prevention.
 * Debounces save operations and handles concurrent save attempts.
 *
 * TEMPORAL COHERENCE (G41):
 * - Encodes delay-based persistence: saves occur `delay` ms after last change
 * - Race condition handling: queue model for concurrent save attempts
 * - Identity: saveInProgressRef tracks save operation continuity
 *
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: Data comparison (JSON.stringify) happens synchronously
 * - Effect boundary: Async save operation isolated in performSave
 * - No render-phase side effects: All mutations in callbacks/effects
 *
 * REF USAGE (G45 - Identity, not data flow):
 * - saveInProgressRef: Models IDENTITY of ongoing save operation
 * - pendingSaveRef: Models IDENTITY of queued save request
 * - lastSavedDataRef: Models IDENTITY of successfully saved snapshot
 * - mountedRef: Models IDENTITY of component lifecycle
 * - CRITICAL: These are NOT state - they track operation identity across renders
 *
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Save triggers: After `delay` ms of data inactivity
 * - Save completes: Asynchronously, may span multiple renders
 * - Save persists: lastSavedDataRef holds last successful save
 * - Cleanup: mountedRef prevents post-unmount state updates
 *
 * FAIL-FAST GUARDS (G54):
 * - Validates enabled state before saving
 * - Checks mounted state before callbacks
 * - Wraps errors in domain-specific AutoSaveError
 *
 * @example
 * ```typescript
 * const { forceSave, isSaving } = useAutoSave({
 *   data: formData,
 *   onSave: async (data) => await api.saveDocument(data),
 *   delay: 2000,
 *   enabled: isDirty,
 *   onSuccess: () => notify.success('Saved'),
 *   onError: (error) => notify.error(error.message)
 * });
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';

import { FORM_AUTO_SAVE_DELAY_MS } from '@/config/features/forms.config';

import { useDebouncedCallback } from './useDebounce';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Domain-specific error for auto-save operations
 */
export class AutoSaveError extends Error {
  public override readonly cause?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, { cause });
    this.name = 'AutoSaveError';
    this.context = context;
  }
}

/**
 * Options for useAutoSave hook
 */
export interface UseAutoSaveOptions<T> {
  /** Data to auto-save */
  data: T;
  /** Async save function */
  onSave: (data: T) => Promise<void>;
  /** Debounce delay in milliseconds (default: 2000) */
  delay?: number;
  /** Enable/disable auto-save (default: true) */
  enabled?: boolean;
  /** Callback on successful save */
  onSuccess?: () => void;
  /** Callback on save error */
  onError?: (error: AutoSaveError) => void;
}

/**
 * Return type for useAutoSave hook
 */
export interface UseAutoSaveReturn {
  /** Manually trigger immediate save */
  forceSave: () => void;
  /** Whether save is currently in progress */
  isSaving: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Automatically saves data with debouncing and race condition prevention.
 *
 * G54 (FAIL-FAST): Runtime guards ensure correct usage and prevent silent corruption
 * G49 (IDEMPOTENCY): Race condition handling via refs makes this safe under re-execution
 * G50 (RENDER COUNT): Uses refs to avoid render count assumptions
 *
 * @param options - Configuration options
 * @returns Object with forceSave method and isSaving state
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  // G54: Fail-fast validation
  if (process.env.NODE_ENV !== 'production') {
    if (!options.data) {
      throw new Error('[useAutoSave] options.data is required');
    }
    if (typeof options.onSave !== 'function') {
      throw new Error('[useAutoSave] options.onSave must be a function');
    }
  }

  // G45: Refs model IDENTITY, not data flow
  const saveInProgressRef = useRef(false);  // Identity: ongoing save operation
  const pendingSaveRef = useRef(false);     // Identity: queued save request
  const lastSavedDataRef = useRef<T>(options.data);  // Identity: last saved snapshot
  const mountedRef = useRef(true);          // Identity: component lifecycle

  const { data, onSave, delay = FORM_AUTO_SAVE_DELAY_MS, enabled = true, onSuccess, onError } = options;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
    // CAUSAL DEPENDENCIES (G46): Empty deps = mount/unmount lifecycle only
  }, []);

  const performSave = useCallback(async (dataToSave: T) => {
    if (saveInProgressRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    // Don't save if data hasn't changed
    if (JSON.stringify(dataToSave) === JSON.stringify(lastSavedDataRef.current)) {
      return;
    }

    saveInProgressRef.current = true;
    pendingSaveRef.current = false;

    try {
      await onSave(dataToSave);

      if (mountedRef.current) {
        lastSavedDataRef.current = dataToSave;
        onSuccess?.();
      }
    } catch (error) {
      if (mountedRef.current) {
        const autoSaveError = new AutoSaveError(
          'Failed to auto-save data',
          error as Error,
          { dataToSave }
        );
        onError?.(autoSaveError);
      }
    } finally {
      saveInProgressRef.current = false;

      // If another save was requested during execution, trigger it
      if (pendingSaveRef.current && mountedRef.current) {
        await performSave(data);
      }
    }
  }, [onSave, data, onSuccess, onError]);

  const debouncedSave = useDebouncedCallback(
    // Wrap async call in void function to match expected signature
    (dataToSave: unknown) => {
      performSave(dataToSave as T);
    },
    delay
  );

  useEffect(() => {
    if (!enabled) return;

    debouncedSave(data);
  }, [data, enabled, debouncedSave]);

  const forceSave = useCallback(() => {
    if (enabled) {
      performSave(data);
    }
  }, [enabled, data, performSave]);

  return {
    forceSave,
    isSaving: saveInProgressRef.current
  };
}
