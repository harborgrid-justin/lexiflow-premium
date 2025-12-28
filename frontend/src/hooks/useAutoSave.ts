/**
 * @module hooks/useAutoSave
 * 
 * Provides automatic data persistence with race condition prevention.
 * Debounces save operations and handles concurrent save attempts.
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
import { useDebouncedCallback } from './useDebounce';
import { FORM_AUTO_SAVE_DELAY_MS } from '@/config';

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
 * @param options - Configuration options
 * @returns Object with forceSave method and isSaving state
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const saveInProgressRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const lastSavedDataRef = useRef<T>(options.data);
  const mountedRef = useRef(true);
  
  const { data, onSave, delay = FORM_AUTO_SAVE_DELAY_MS, enabled = true, onSuccess, onError } = options;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
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
