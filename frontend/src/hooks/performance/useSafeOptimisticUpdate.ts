import { useCallback, useRef, useState } from "react";

/**
 * Hook for Optimistic UI with Safe Rollback
 *
 * REQUIREMENTS ADDRESSED:
 * - OPTIMISTIC UI WITH SAFE ROLLBACK: State versioning, reversibility
 * - VALIDATION: User intent preserved if newer updates occur
 *
 * @param initialState The initial stable state (usually from server)
 */
export function useSafeOptimisticUpdate<T>(initialState: T) {
  const [optimisticState, setOptimisticState] = useState<T>(initialState);
  const [error, setError] = useState<Error | null>(null);
  const versionRef = useRef(0);

  /**
   * Execute an optimistic update
   * @param newData The new state to display immediately
   * @param syncFn The async function to persist the data
   */
  const update = useCallback(
    async (newData: T, syncFn: (data: T) => Promise<void>) => {
      const currentVersion = ++versionRef.current;

      // 1. Optimistic Update: Apply immediately
      const previousState = optimisticState;
      setOptimisticState(newData);
      setError(null);

      try {
        // 2. Sync: Attempt persistence
        await syncFn(newData);

        // Success: State remains as is (or is eventually consistent via server re-fetch)
      } catch (err) {
        // 3. Rollback Logic
        // Strategy: Only rollback if no newer updates have been initiated
        // This prevents "Jumping" if the user has already continued typing/editing
        if (versionRef.current === currentVersion) {
          setOptimisticState(previousState);
          setError(err as Error);
        } else {
          // A newer update has already happened.
          // We log the error but don't revert UI to avoid overwriting newer user intent.
          console.warn(
            "Optimistic update failed but state has advanced. Suppressing rollback.",
            err
          );

          // Ideally, we should notify the user via a toast that "Saving intermediate state failed"
          // But we preserve the current UI state.
        }
      }
    },
    [optimisticState]
  );

  return {
    state: optimisticState,
    update,
    error,
    retry: () => update(optimisticState, async () => {}), // Placeholder for retry logic
  };
}
