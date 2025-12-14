/**
 * @module hooks/useAutoSave
 * @description Auto-save hook with race condition prevention
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDebouncedCallback } from './useDebounce';

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  onSuccess,
  onError
}: UseAutoSaveOptions<T>) {
  const saveInProgressRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const lastSavedDataRef = useRef<T>(data);
  const mountedRef = useRef(true);

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
        onError?.(error as Error);
      }
    } finally {
      saveInProgressRef.current = false;

      // If another save was requested during execution, trigger it
      if (pendingSaveRef.current && mountedRef.current) {
        performSave(data);
      }
    }
  }, [onSave, data, onSuccess, onError]);

  const debouncedSave = useDebouncedCallback(performSave, delay);

  useEffect(() => {
    if (!enabled) return;

    debouncedSave(data);
  }, [data, enabled, debouncedSave]);

  const forceSave = useCallback(() => {
    if (enabled) {
      performSave(data);
    }
  }, [data, enabled, performSave]);

  return {
    forceSave,
    isSaving: saveInProgressRef.current
  };
}
