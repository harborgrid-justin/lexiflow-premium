/**
 * @module hooks/useEnhancedAutoSave
 * @category Hooks - Forms
 * @description Enhanced auto-save with conflict resolution, optimistic updates, and version control
 *
 * FEATURES:
 * - Debounced auto-save with configurable delay
 * - Conflict detection and resolution
 * - Optimistic UI updates
 * - Version tracking
 * - Network error handling with retry
 * - Offline support with queue
 * - Last saved timestamp tracking
 * - Save status indicators
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { FORM_AUTO_SAVE_DELAY_MS } from "@/config/features/forms.config";

import { useDebouncedCallback } from "./useDebounce";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Save status
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy =
  | "overwrite" // Overwrite server version
  | "merge" // Attempt to merge changes
  | "manual" // Require manual resolution
  | "keepLocal" // Keep local version
  | "keepServer"; // Keep server version

/**
 * Version metadata
 */
export interface VersionMetadata {
  /** Version identifier */
  version: string;
  /** Last modified timestamp */
  timestamp: number;
  /** User who made the change */
  userId?: string;
  /** Change description */
  description?: string;
}

/**
 * Save result
 */
export interface SaveResult<T> {
  /** Was save successful */
  success: boolean;
  /** Updated data from server */
  data?: T;
  /** Version metadata */
  version?: VersionMetadata;
  /** Error if save failed */
  error?: Error;
  /** Was there a conflict */
  conflict?: boolean;
  /** Server version (if conflict) */
  serverData?: T;
}

/**
 * Auto-save options
 */
export interface UseEnhancedAutoSaveOptions<T> {
  /** Data to auto-save */
  data: T;
  /** Save function - returns updated data and version */
  onSave: (data: T, version?: string) => Promise<SaveResult<T>>;
  /** Debounce delay in milliseconds */
  delay?: number;
  /** Enable/disable auto-save */
  enabled?: boolean;
  /** Current version (for conflict detection) */
  version?: string;
  /** Conflict resolution strategy */
  conflictStrategy?: ConflictResolutionStrategy;
  /** Custom conflict resolver */
  onConflict?: (local: T, server: T) => Promise<T>;
  /** Success callback */
  onSuccess?: (result: SaveResult<T>) => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Save only if validation passes */
  validateBeforeSave?: (data: T) => boolean | Promise<boolean>;
  /** Maximum retry attempts on network error */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Enable offline queue */
  enableOfflineQueue?: boolean;
  /** Compare function to detect changes (default: JSON.stringify) */
  isEqual?: (a: T, b: T) => boolean;
}

/**
 * Auto-save return value
 */
export interface UseEnhancedAutoSaveReturn<T> {
  /** Current save status */
  status: SaveStatus;
  /** Is currently saving */
  isSaving: boolean;
  /** Last saved timestamp */
  lastSaved: Date | null;
  /** Current version */
  version: string | null;
  /** Force immediate save */
  forceSave: () => Promise<void>;
  /** Cancel pending save */
  cancelSave: () => void;
  /** Manually resolve conflict */
  resolveConflict: (resolution: "local" | "server" | T) => Promise<void>;
  /** Get conflict data (if any) */
  conflictData: { local: T; server: T } | null;
  /** Error message (if any) */
  error: string | null;
  /** Number of pending saves */
  pendingCount: number;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Default equality check
 */
function defaultIsEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// HOOK
// ============================================================================

export function useEnhancedAutoSave<T>({
  data,
  onSave,
  delay = FORM_AUTO_SAVE_DELAY_MS,
  enabled = true,
  version: initialVersion,
  conflictStrategy = "manual",
  onConflict,
  onSuccess,
  onError,
  validateBeforeSave,
  maxRetries = 3,
  retryDelay = 1000,
  enableOfflineQueue = false,
  isEqual = defaultIsEqual,
}: UseEnhancedAutoSaveOptions<T>): UseEnhancedAutoSaveReturn<T> {
  // State
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string | null>(
    initialVersion || null
  );
  const [error, setError] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<{
    local: T;
    server: T;
  } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Refs
  const lastSavedDataRef = useRef<T>(data);
  const saveInProgressRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const saveQueueRef = useRef<T[]>([]);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Attempt to merge data (simple shallow merge)
   */
  const attemptMerge = useCallback((local: T, server: T): T => {
    // Simple shallow merge - override with custom onConflict for complex merging
    if (
      typeof local === "object" &&
      typeof server === "object" &&
      local !== null &&
      server !== null
    ) {
      return { ...server, ...local };
    }
    return local;
  }, []);

  /**
   * Handle conflict resolution
   */
  const handleConflict = useCallback(
    async (local: T, server: T): Promise<T> => {
      setStatus("conflict");
      setConflictData({ local, server });

      switch (conflictStrategy) {
        case "overwrite":
        case "keepLocal":
          return local;
        case "keepServer":
          return server;
        case "merge":
          return onConflict
            ? await onConflict(local, server)
            : attemptMerge(local, server);
        case "manual":
          // Wait for manual resolution
          return new Promise((resolve) => {
            // Store resolver for manual resolution
            (
              window as unknown as Record<string, unknown>
            ).__autoSaveConflictResolver = resolve;
          });
        default:
          return local;
      }
    },
    [conflictStrategy, onConflict, attemptMerge]
  );

  /**
   * Perform actual save operation
   */
  const performSave = useCallback(
    async (dataToSave: T, force: boolean = false): Promise<void> => {
      // Prevent concurrent saves
      if (saveInProgressRef.current && !force) {
        pendingSaveRef.current = true;
        if (enableOfflineQueue) {
          saveQueueRef.current.push(dataToSave);
          setPendingCount(saveQueueRef.current.length);
        }
        return;
      }

      // Check if data has actually changed
      if (!force && isEqual(dataToSave, lastSavedDataRef.current)) {
        return;
      }

      // Validate before saving
      if (validateBeforeSave) {
        try {
          const isValid = await validateBeforeSave(dataToSave);
          if (!isValid) {
            console.log("Validation failed, skipping auto-save");
            return;
          }
        } catch (err) {
          console.error("Validation error:", err);
          return;
        }
      }

      saveInProgressRef.current = true;
      setStatus("saving");
      setError(null);

      let attempts = 0;
      let lastError: Error | null = null;

      // Retry loop
      while (attempts <= maxRetries) {
        try {
          // Perform save
          const result = await onSave(dataToSave, currentVersion || undefined);

          if (!mountedRef.current) return;

          if (result.success) {
            // Save successful
            lastSavedDataRef.current = dataToSave;
            setLastSaved(new Date());
            setStatus("saved");

            // Update version if provided
            if (result.version?.version) {
              setCurrentVersion(result.version.version);
            }

            // Clear retry count
            retryCountRef.current = 0;

            // Call success callback
            onSuccess?.(result);

            // Process queue if offline queue is enabled
            if (enableOfflineQueue && saveQueueRef.current.length > 0) {
              const nextData = saveQueueRef.current.shift();
              setPendingCount(saveQueueRef.current.length);
              if (nextData) {
                saveInProgressRef.current = false;
                await performSave(nextData, true);
                return;
              }
            }

            break;
          } else if (result.conflict && result.serverData) {
            // Conflict detected
            const resolved = await handleConflict(
              dataToSave,
              result.serverData
            );
            lastSavedDataRef.current = resolved;
            // Retry with resolved data
            await performSave(resolved, true);
            return;
          } else {
            throw result.error || new Error("Save failed");
          }
        } catch (err) {
          lastError = err as Error;
          attempts++;

          // Retry with exponential backoff
          if (attempts <= maxRetries) {
            await sleep(retryDelay * Math.pow(2, attempts - 1));
          }
        }
      }

      // All retries failed
      if (lastError) {
        if (mountedRef.current) {
          setStatus("error");
          setError(lastError.message || "Save failed");
          onError?.(lastError);
        }
      }

      saveInProgressRef.current = false;

      // Check if another save was requested
      if (pendingSaveRef.current && mountedRef.current) {
        pendingSaveRef.current = false;
        await performSave(data, false);
      }
    },
    [
      data,
      currentVersion,
      onSave,
      onSuccess,
      onError,
      validateBeforeSave,
      maxRetries,
      retryDelay,
      enableOfflineQueue,
      isEqual,
      handleConflict,
    ]
  );

  /**
   * Manually resolve conflict
   */
  const resolveConflict = useCallback(
    async (resolution: "local" | "server" | T): Promise<void> => {
      if (!conflictData) return;

      let resolvedData: T;
      if (resolution === "local") {
        resolvedData = conflictData.local;
      } else if (resolution === "server") {
        resolvedData = conflictData.server;
      } else {
        resolvedData = resolution;
      }

      // Clear conflict
      setConflictData(null);
      setStatus("idle");

      // Call resolver if exists
      const resolver = (window as unknown as Record<string, unknown>)
        .__autoSaveConflictResolver;
      if (resolver && typeof resolver === "function") {
        (resolver as (data: T) => void)(resolvedData);
        delete (window as unknown as Record<string, unknown>)
          .__autoSaveConflictResolver;
      }

      // Trigger save with resolved data
      lastSavedDataRef.current = resolvedData;
      await performSave(resolvedData, true);
    },
    [conflictData, performSave]
  );

  /**
   * Debounced save
   */
  const debouncedSave = useDebouncedCallback((...args: unknown[]) => {
    const dataToSave = args[0] as T;
    performSave(dataToSave, false);
  }, delay);

  /**
   * Effect: Trigger auto-save when data changes
   */
  useEffect(() => {
    if (!enabled) return;

    debouncedSave(data);
  }, [data, enabled, debouncedSave]);

  /**
   * Force immediate save
   */
  const forceSave = useCallback(async (): Promise<void> => {
    if (enabled) {
      await performSave(data, true);
    }
  }, [enabled, data, performSave]);

  /**
   * Cancel pending save
   */
  const cancelSave = useCallback(() => {
    pendingSaveRef.current = false;
    saveQueueRef.current = [];
    setPendingCount(0);
  }, []);

  return {
    status,
    isSaving: status === "saving",
    lastSaved,
    version: currentVersion,
    forceSave,
    cancelSave,
    resolveConflict,
    conflictData,
    error,
    pendingCount,
  };
}
