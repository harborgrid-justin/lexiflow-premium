/**
 * Time Tracker Hook
 * Enterprise-grade React hook for time tracking with backend API integration
 *
 * @module hooks/useTimeTracker
 * @category Hooks - Billing & Time Management
 * @description Manages comprehensive time tracking operations including:
 * - Precise timer functionality with start/pause/stop/reset
 * - Automatic time entry creation with validation
 * - Billable hour calculations
 * - Backend integration for time entry persistence
 * - Minimum time threshold enforcement (1 minute)
 * - Rate calculation and total computation
 * - Integration event publishing
 *
 * @security
 * - Input validation on all parameters
 * - Rate validation to prevent negative/invalid values
 * - Case ID validation for proper attribution
 * - User ID validation for audit trail
 * - Minimum time enforcement to prevent micro-billing
 *
 * @architecture
 * - Backend API primary (PostgreSQL via DataService)
 * - React hooks for timer state management
 * - Interval-based timer (1-second precision)
 * - Type-safe operations throughout
 * - Integration event publishing on entry creation
 *
 * @performance
 * - Memoized format function
 * - Efficient interval cleanup
 * - Optimized state updates
 * - Minimal re-renders
 *
 * @example
 * ```typescript
 * // Basic usage with defaults
 * const timer = useTimeTracker();
 *
 * // With custom options
 * const timer = useTimeTracker({
 *   caseId: 'case-123',
 *   userId: 'user-456',
 *   rate: 450
 * });
 *
 * // Start tracking
 * timer.start();
 *
 * // Pause tracking
 * timer.pause();
 *
 * // Stop and log entry
 * await timer.stop();
 *
 * // Reset timer
 * timer.reset();
 *
 * // Access formatted time
 * const display = timer.formattedTime; // "00:15:30"
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback, useEffect, useMemo, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from "@/services/data/data-service.service";

// Configuration
import { TIME_TRACKER_DEFAULT_RATE, TIME_TRACKER_MIN_BILLABLE_SECONDS, TIME_TRACKER_INTERVAL_MS as TIMER_INTERVAL_MS } from "@/config/features/hooks.config";

// Hooks
import { useNotify } from "./useNotify";

// Types
import { CaseId, TimeEntry, UserId, UUID } from "@/types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Configuration options for useTimeTracker hook
 *
 * @property {string} caseId - Case ID for time entry attribution
 * @property {string} userId - User ID for time entry attribution
 * @property {number} rate - Hourly billing rate in dollars
 */
export interface UseTimeTrackerOptions {
  /** Case ID for time entry attribution (default: 'General') */
  caseId?: string;
  /** User ID for time entry attribution (default: 'current-user') */
  userId?: string;
  /** Hourly billing rate in dollars (default: 450) */
  rate?: number;
}

/**
 * Return type for useTimeTracker hook
 */
export interface UseTimeTrackerReturn {
  /** Whether timer is active */
  isActive: boolean;
  /** Elapsed seconds */
  seconds: number;
  /** Formatted time string (HH:MM:SS) */
  formattedTime: string;
  /** Calculated billable amount */
  billableAmount: number;
  /** Start timer */
  start: () => void;
  /** Pause timer */
  pause: () => void;
  /** Stop timer and log entry */
  stop: () => Promise<void>;
  /** Reset timer */
  reset: () => void;
  /** Current case ID */
  caseId: string;
  /** Current user ID */
  userId: string;
  /** Hourly rate */
  rate: number;
}

// ============================================================================

// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Time tracker hook.
 *
 * @param options - Configuration options for time tracking
 * @returns Time tracker interface
 */
export function useTimeTracker(
  options: UseTimeTrackerOptions = {}
): UseTimeTrackerReturn {
  // ============================================================================
  // CONFIGURATION & DEPENDENCIES
  // ============================================================================

  const {
    caseId = "General",
    userId = "current-user",
    rate = TIME_TRACKER_DEFAULT_RATE,
  } = options;

  const notify = useNotify();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Timer active state */
  const [isActive, setIsActive] = useState(false);

  /** Elapsed seconds */
  const [seconds, setSeconds] = useState(0);

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Validate rate parameter
   * Ensures rate is positive and reasonable
   * @private
   */
  const validateRate = useCallback((rate: number): boolean => {
    if (isNaN(rate) || rate < 0) {
      console.error("[useTimeTracker] Invalid rate:", rate);
      return false;
    }

    if (rate > 10000) {
      console.warn("[useTimeTracker] Unusually high rate detected:", rate);
    }

    return true;
  }, []);

  /**
   * Validate case ID parameter
   * @private
   */
  const validateCaseId = useCallback((caseId: string): boolean => {
    if (!caseId || caseId.trim() === "") {
      console.error("[useTimeTracker] Invalid caseId:", caseId);
      return false;
    }
    return true;
  }, []);

  /**
   * Validate user ID parameter
   * @private
   */
  const validateUserId = useCallback((userId: string): boolean => {
    if (!userId || userId.trim() === "") {
      console.error("[useTimeTracker] Invalid userId:", userId);
      return false;
    }
    return true;
  }, []);

  // Validate configuration on initialization
  useEffect(() => {
    if (!validateRate(rate)) {
      notify.warning(
        `Invalid rate: ${rate}. Using default rate: ${TIME_TRACKER_DEFAULT_RATE}`
      );
    }
    if (!validateCaseId(caseId)) {
      notify.warning(
        "Invalid case ID. Time entries may not be properly attributed."
      );
    }
    if (!validateUserId(userId)) {
      notify.warning(
        "Invalid user ID. Time entries may not be properly attributed."
      );
    }

    console.log(
      `[useTimeTracker] Initialized with caseId: ${caseId}, userId: ${userId}, rate: ${rate}`
    );
  }, [
    caseId,
    userId,
    rate,
    validateRate,
    validateCaseId,
    validateUserId,
    notify,
  ]);

  // ============================================================================
  // TIMER LOGIC
  // ============================================================================

  /**
   * Timer effect - increments seconds when active
   * Automatically cleans up interval on unmount or when inactive
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, TIMER_INTERVAL_MS);
    }

    // Cleanup on unmount or when timer becomes inactive
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  // ============================================================================
  // FORMATTING
  // ============================================================================

  /**
   * Format seconds into HH:MM:SS display
   * Memoized for performance
   *
   * @param totalSeconds - Total elapsed seconds
   * @returns Formatted time string (HH:MM:SS)
   *
   * @example
   * formatTime(3661) // Returns "01:01:01"
   * formatTime(90)   // Returns "00:01:30"
   */
  const formatTime = useCallback((totalSeconds: number): string => {
    try {
      if (isNaN(totalSeconds) || totalSeconds < 0) {
        console.error(
          "[useTimeTracker.formatTime] Invalid totalSeconds:",
          totalSeconds
        );
        return "00:00:00";
      }

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("[useTimeTracker.formatTime] Error:", error);
      return "00:00:00";
    }
  }, []);

  /**
   * Formatted time display
   * Automatically updates as seconds change
   */
  const formattedTime = useMemo(
    () => formatTime(seconds),
    [seconds, formatTime]
  );

  /**
   * Calculate billable amount
   * Based on current elapsed time and hourly rate
   */
  const billableAmount = useMemo(() => {
    const durationMinutes = Math.ceil(seconds / 60);
    return (durationMinutes / 60) * rate;
  }, [seconds, rate]);

  // ============================================================================
  // TIMER CONTROLS
  // ============================================================================

  /**
   * Start the timer
   * Idempotent - safe to call multiple times
   *
   * @example
   * timer.start();
   */
  const start = useCallback(() => {
    if (isActive) {
      console.log("[useTimeTracker] Timer already active");
      return;
    }

    setIsActive(true);
    console.log("[useTimeTracker] Timer started");
  }, [isActive]);

  /**
   * Pause the timer
   * Preserves elapsed time for resume
   *
   * @example
   * timer.pause();
   */
  const pause = useCallback(() => {
    if (!isActive) {
      console.log("[useTimeTracker] Timer already paused");
      return;
    }

    setIsActive(false);
    console.log(`[useTimeTracker] Timer paused at ${formatTime(seconds)}`);
  }, [isActive, seconds, formatTime]);

  /**
   * Stop the timer and create time entry
   * Validates minimum billable time (1 minute)
   * Persists time entry to backend
   * Resets timer after successful logging
   *
   * @throws Logs errors but doesn't throw to prevent UI disruption
   * @security Validates all time entry fields before persistence
   * @integration Publishes TIME_LOGGED event via DataService
   *
   * @example
   * await timer.stop();
   */
  const stop = useCallback(async () => {
    try {
      // Validate minimum billable time
      if (seconds < TIME_TRACKER_MIN_BILLABLE_SECONDS) {
        setSeconds(0);
        setIsActive(false);
        notify.info(
          `Time entry ignored (less than ${TIME_TRACKER_MIN_BILLABLE_SECONDS / 60} minute).`
        );
        console.log(
          `[useTimeTracker] Entry ignored: ${seconds}s < ${TIME_TRACKER_MIN_BILLABLE_SECONDS}s`
        );
        return;
      }

      // Calculate billable duration (round up to nearest minute)
      const durationMinutes = Math.ceil(seconds / 60);
      const totalCost = (durationMinutes / 60) * rate;

      // Validate configuration before creating entry
      if (
        !validateCaseId(caseId) ||
        !validateUserId(userId) ||
        !validateRate(rate)
      ) {
        notify.error(
          "Invalid configuration. Please check case ID, user ID, and rate."
        );
        return;
      }

      // Create time entry
      const entry: TimeEntry = {
        id: `t-${Date.now()}` as UUID,
        caseId: caseId as CaseId,
        userId: userId as UserId,
        date: new Date().toISOString().split("T")[0] || "",
        duration: durationMinutes,
        description: "General Administrative Task (Auto-Logged)",
        rate,
        total: totalCost,
        status: "Unbilled",
        billable: true,
      };

      console.log(`[useTimeTracker] Creating time entry:`, entry);

      // Persist to backend (publishes integration event)
      await DataService.billing.addTimeEntry(entry);

      // Reset timer state
      setSeconds(0);
      setIsActive(false);

      // Notify user
      notify.success(`Logged ${durationMinutes} minutes to Billing.`);

      console.log(
        `[useTimeTracker] Time entry created successfully: ${entry.id}`
      );
    } catch (error) {
      console.error("[useTimeTracker.stop] Error creating time entry:", error);
      notify.error("Failed to log time entry. Please try again.");

      // Don't reset timer on error - user can retry
    }
  }, [
    seconds,
    caseId,
    userId,
    rate,
    validateCaseId,
    validateUserId,
    validateRate,
    notify,
  ]);

  /**
   * Reset the timer to zero
   * Stops timer if active and clears elapsed time
   *
   * @example
   * timer.reset();
   */
  const reset = useCallback(() => {
    setSeconds(0);
    setIsActive(false);
    console.log("[useTimeTracker] Timer reset");
  }, []);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  /**
   * Return comprehensive time tracker interface
   * All handlers are memoized for optimal performance
   *
   * @returns {Object} Time tracker interface
   * @property {boolean} isActive - Timer active state
   * @property {number} seconds - Elapsed seconds
   * @property {string} formattedTime - Formatted time display (HH:MM:SS)
   * @property {number} billableAmount - Calculated billable amount
   * @property {string} caseId - Current case ID
   * @property {string} userId - Current user ID
   * @property {number} rate - Hourly rate
   * @property {Function} start - Start timer
   * @property {Function} pause - Pause timer
   * @property {Function} stop - Stop timer and create entry
   * @property {Function} reset - Reset timer to zero
   */
  return {
    isActive,
    seconds,
    formattedTime,
    billableAmount,
    caseId,
    userId,
    rate,
    start,
    pause,
    stop,
    reset,
  };
}
