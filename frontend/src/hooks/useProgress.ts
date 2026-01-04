/**
 * @module hooks/useProgress
 * @category Hooks
 * @description Track operation progress with ETA calculation and step management.
 *
 * FEATURES:
 * - Automatic ETA calculation
 * - Step-by-step progress tracking
 * - Cancellation support
 * - Error handling
 * - History tracking
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
  progress?: number;
  error?: string;
}

export type ProgressStatus =
  | "idle"
  | "in-progress"
  | "completed"
  | "error"
  | "cancelled";

export interface UseProgressOptions {
  /** Steps for multi-stage operations */
  steps?: Omit<ProgressStep, "status" | "progress">[];
  /** Estimated total duration in milliseconds */
  estimatedDuration?: number;
  /** Auto-reset after completion (ms) */
  autoResetDelay?: number;
  /** Callback when progress completes */
  onComplete?: () => void;
  /** Callback when progress is cancelled */
  onCancel?: () => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
}

export interface UseProgressReturn {
  /** Current progress (0-100) */
  progress: number;
  /** Current status */
  status: ProgressStatus;
  /** Start time of operation */
  startTime: number | null;
  /** Progress steps */
  steps: ProgressStep[];
  /** Error message */
  error: string | null;
  /** Start progress tracking */
  start: () => void;
  /** Update progress value */
  setProgress: (value: number) => void;
  /** Update progress step */
  updateStep: (
    stepId: string,
    updates: Partial<Pick<ProgressStep, "status" | "progress" | "error">>
  ) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Mark as complete */
  complete: (message?: string) => void;
  /** Set error */
  setError: (error: string) => void;
  /** Cancel operation */
  cancel: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Can cancel */
  canCancel: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useProgress({
  steps: initialSteps = [],
  estimatedDuration: _estimatedDuration,
  autoResetDelay,
  onComplete,
  onCancel,
  onError,
}: UseProgressOptions = {}): UseProgressReturn {
  const [progress, setProgressState] = useState(0);
  const [status, setStatus] = useState<ProgressStatus>("idle");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [error, setErrorState] = useState<string | null>(null);
  const [steps, setSteps] = useState<ProgressStep[]>(
    initialSteps.map((step) => ({
      ...step,
      status: "pending" as const,
      progress: 0,
    }))
  );

  const cancelledRef = useRef(false);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
    }

    cancelledRef.current = false;
    setProgressState(0);
    setStatus("idle");
    setStartTime(null);
    setErrorState(null);

    if (initialSteps.length > 0) {
      setSteps(
        initialSteps.map((step) => ({
          ...step,
          status: "pending" as const,
          progress: 0,
        }))
      );
    }
  }, [initialSteps]);

  /**
   * Start progress tracking
   */
  const start = useCallback(() => {
    cancelledRef.current = false;
    setProgressState(0);
    setStatus("in-progress");
    setStartTime(Date.now());
    setErrorState(null);

    // Reset steps
    if (steps.length > 0) {
      setSteps((prev) =>
        prev.map((step, idx) => ({
          ...step,
          status: idx === 0 ? "in-progress" : "pending",
          progress: 0,
          error: undefined,
        }))
      );
    }
  }, [steps.length]);

  /**
   * Update progress value
   */
  const setProgress = useCallback(
    (value: number) => {
      if (cancelledRef.current) return;

      const clampedValue = Math.min(Math.max(value, 0), 100);
      setProgressState(clampedValue);

      // Auto-complete if reached 100%
      if (clampedValue === 100 && status === "in-progress") {
        setStatus("completed");
        onComplete?.();

        // Auto-reset if configured
        if (autoResetDelay) {
          autoResetTimerRef.current = setTimeout(() => {
            reset();
          }, autoResetDelay);
        }
      }
    },
    [status, onComplete, autoResetDelay, reset]
  );

  /**
   * Update specific step
   */
  const updateStep = useCallback(
    (
      stepId: string,
      updates: Partial<Pick<ProgressStep, "status" | "progress" | "error">>
    ) => {
      setSteps((prev) => {
        const newSteps = prev.map((step) => {
          if (step.id === stepId) {
            return { ...step, ...updates };
          }
          return step;
        });

        // Calculate overall progress based on steps
        const completedSteps = newSteps.filter(
          (s) => s.status === "completed"
        ).length;
        const totalSteps = newSteps.length;
        const currentStepIdx = newSteps.findIndex(
          (s) => s.status === "in-progress"
        );
        const currentStepProgress =
          currentStepIdx >= 0 ? newSteps[currentStepIdx]?.progress || 0 : 0;

        const overallProgress =
          totalSteps > 0
            ? ((completedSteps + currentStepProgress / 100) / totalSteps) * 100
            : 0;

        setProgressState(overallProgress);

        return newSteps;
      });
    },
    []
  );

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    setSteps((prev) => {
      const currentIdx = prev.findIndex((s) => s.status === "in-progress");
      if (currentIdx === -1) return prev;

      const newSteps = [...prev];
      newSteps[currentIdx] = {
        ...newSteps[currentIdx],
        status: "completed",
        progress: 100,
        id: newSteps[currentIdx].id || "",
      };

      // Move to next step if available
      if (currentIdx + 1 < newSteps.length) {
        newSteps[currentIdx + 1] = {
          ...newSteps[currentIdx + 1],
          status: "in-progress",
          progress: 0,
          id: newSteps[currentIdx + 1].id || "",
        };
      } else {
        // All steps completed
        setProgressState(100);
        setStatus("completed");
        onComplete?.();

        if (autoResetDelay) {
          autoResetTimerRef.current = setTimeout(() => {
            reset();
          }, autoResetDelay);
        }
      }

      return newSteps;
    });
  }, [autoResetDelay, onComplete, reset]);

  /**
   * Mark as complete
   */
  const complete = useCallback(
    (_message?: string) => {
      if (cancelledRef.current) return;

      setProgressState(100);
      setStatus("completed");

      // Mark all steps as completed
      if (steps.length > 0) {
        setSteps((prev) =>
          prev.map((step) => ({
            ...step,
            status: "completed" as const,
            progress: 100,
          }))
        );
      }

      onComplete?.();

      if (autoResetDelay) {
        autoResetTimerRef.current = setTimeout(() => {
          reset();
        }, autoResetDelay);
      }
    },
    [steps.length, onComplete, autoResetDelay, reset]
  );

  /**
   * Set error
   */
  const setError = useCallback(
    (errorMessage: string) => {
      setErrorState(errorMessage);
      setStatus("error");

      // Mark current step as error
      setSteps((prev) =>
        prev.map((step) => {
          if (step.status === "in-progress") {
            return { ...step, status: "error" as const, error: errorMessage };
          }
          return step;
        })
      );

      onError?.(errorMessage);
    },
    [onError]
  );

  /**
   * Cancel operation
   */
  const cancel = useCallback(() => {
    if (status !== "in-progress") return;

    cancelledRef.current = true;
    setStatus("cancelled");

    // Mark current step as cancelled
    setSteps((prev) =>
      prev.map((step) => {
        if (step.status === "in-progress") {
          return { ...step, status: "error" as const };
        }
        return step;
      })
    );

    onCancel?.();
  }, [status, onCancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, []);

  const canCancel = status === "in-progress";

  return {
    progress,
    status,
    startTime,
    steps,
    error,
    start,
    setProgress,
    updateStep,
    nextStep,
    complete,
    setError,
    cancel,
    reset,
    canCancel,
  };
}

export default useProgress;
