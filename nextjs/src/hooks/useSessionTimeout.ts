/**
 * useSessionTimeout Hook
 *
 * Manages session timeout with proactive warnings and activity-based reset.
 *
 * Features:
 * - Configurable session duration and warning threshold
 * - Activity-based timer reset (mouse, keyboard, touch, scroll)
 * - Proactive warning dispatch via custom event
 * - Session extension capability without re-login
 * - Countdown timer state for UI display
 *
 * @module hooks/useSessionTimeout
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface SessionTimeoutConfig {
  /** Total session duration in milliseconds (default: 30 minutes) */
  sessionDuration?: number;
  /** Time before expiry to show warning in milliseconds (default: 5 minutes) */
  warningThreshold?: number;
  /** Whether to track user activity for auto-reset (default: true) */
  trackActivity?: boolean;
  /** Debounce time for activity events in milliseconds (default: 1000) */
  activityDebounce?: number;
  /** Callback when session expires */
  onSessionExpire?: () => void;
  /** Callback when warning is triggered */
  onWarning?: (remainingTime: number) => void;
  /** Whether the hook is enabled (default: true) */
  enabled?: boolean;
}

export interface SessionTimeoutState {
  /** Whether a warning is currently shown */
  isWarningActive: boolean;
  /** Remaining time in seconds (only accurate when warning is active) */
  remainingSeconds: number;
  /** Whether the session has expired */
  isExpired: boolean;
  /** Time until warning in milliseconds */
  timeUntilWarning: number;
  /** Session expiry timestamp */
  expiresAt: Date | null;
  /** Last activity timestamp */
  lastActivityAt: Date | null;
}

export interface SessionTimeoutActions {
  /** Extend the session (resets all timers) */
  extendSession: () => void;
  /** Reset the session timer based on activity */
  resetSessionTimer: () => void;
  /** Manually trigger session expiry */
  expireSession: () => void;
  /** Dismiss the warning without extending */
  dismissWarning: () => void;
}

export interface UseSessionTimeoutReturn
  extends SessionTimeoutState, SessionTimeoutActions {}

// ============================================================================
// Constants
// ============================================================================

/** Default session duration: 30 minutes */
const DEFAULT_SESSION_DURATION = 30 * 60 * 1000;

/** Default warning threshold: 5 minutes before expiry */
const DEFAULT_WARNING_THRESHOLD = 5 * 60 * 1000;

/** Default activity debounce: 1 second */
const DEFAULT_ACTIVITY_DEBOUNCE = 1000;

/** Activity events to track */
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "mousemove",
] as const;

/** Custom event name for session warning */
export const SESSION_WARNING_EVENT = "session-warning";

/** Custom event name for session expiry */
export const SESSION_EXPIRED_EVENT = "session-expired";

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSessionTimeout(
  config: SessionTimeoutConfig = {}
): UseSessionTimeoutReturn {
  const {
    sessionDuration = DEFAULT_SESSION_DURATION,
    warningThreshold = DEFAULT_WARNING_THRESHOLD,
    trackActivity = true,
    activityDebounce = DEFAULT_ACTIVITY_DEBOUNCE,
    onSessionExpire,
    onWarning,
    enabled = true,
  } = config;

  // State
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [lastActivityAt, setLastActivityAt] = useState<Date | null>(null);

  // Refs for timers
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityDebounceRef = useRef<NodeJS.Timeout | null>(null);
  // Initialize with static value to avoid impure render
  const lastActivityTimeRef = useRef<number>(0);

  // Initialize timestamp lazily
  useEffect(() => {
    if (lastActivityTimeRef.current === 0) {
      lastActivityTimeRef.current = Date.now();
    }
  }, []);

  // Computed time until warning
  const [now, setNow] = useState(0); // Initialized with 0, updated in effect

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const timeUntilWarning = useMemo(() => {
    // Avoid accessing Date.now() during render
    if (!expiresAt) return sessionDuration - warningThreshold;
    // We use the stored state or ref for stability, or recalculate in effect
    // But since useMemo runs during render, we should rely on 'now' state
    const currentTime = now || Date.now(); // Fallback if 0 (first render) but standard is using state
    return expiresAt - currentTime;
  }, [expiresAt, sessionDuration, warningThreshold, now]);
    // Here we just return the static difference based on expiry
    return Math.max(
      0,
      expiresAt.getTime() -
        (lastActivityAt?.getTime() || now) -
        warningThreshold
    );
  }, [expiresAt, sessionDuration, warningThreshold, lastActivityAt, now]);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (activityDebounceRef.current) {
      clearTimeout(activityDebounceRef.current);
      activityDebounceRef.current = null;
    }
  }, []);

  // Start countdown timer for warning display
  const startCountdown = useCallback((initialSeconds: number) => {
    setRemainingSeconds(initialSeconds);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Handle session expiry
  const handleSessionExpire = useCallback(() => {
    clearAllTimers();
    setIsExpired(true);
    setIsWarningActive(false);
    setRemainingSeconds(0);

    // Dispatch custom event for global listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    onSessionExpire?.();
  }, [clearAllTimers, onSessionExpire]);

  // Handle warning trigger
  const handleWarning = useCallback(() => {
    const warningSeconds = Math.floor(warningThreshold / 1000);
    setIsWarningActive(true);
    startCountdown(warningSeconds);

    // Dispatch custom event for global listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SESSION_WARNING_EVENT, {
          detail: { remainingTime: warningThreshold },
        })
      );
    }

    onWarning?.(warningThreshold);
  }, [warningThreshold, startCountdown, onWarning]);

  // Start session with new timers
  const startSession = useCallback(() => {
    const now = new Date();
    const expiry = new Date(now.getTime() + sessionDuration);

    setExpiresAt(expiry);
    setLastActivityAt(now);
    setIsWarningActive(false);
    setIsExpired(false);
    setRemainingSeconds(0);

    clearAllTimers();

    // Set warning timeout
    const timeToWarning = sessionDuration - warningThreshold;
    warningTimeoutRef.current = setTimeout(() => {
      handleWarning();
    }, timeToWarning);

    // Set session timeout
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionExpire();
    }, sessionDuration);

    lastActivityTimeRef.current = Date.now();
  }, [
    sessionDuration,
    warningThreshold,
    clearAllTimers,
    handleWarning,
    handleSessionExpire,
  ]);

  // Extend session (for user action)
  const extendSession = useCallback(() => {
    if (!enabled) return;
    startSession();
  }, [enabled, startSession]);

  // Reset session timer based on activity
  const resetSessionTimer = useCallback(() => {
    if (!enabled || isWarningActive) return;

    const now = new Date();
    setLastActivityAt(now);
    startSession();
  }, [enabled, isWarningActive, startSession]);

  // Manually expire session
  const expireSession = useCallback(() => {
    handleSessionExpire();
  }, [handleSessionExpire]);

  // Dismiss warning without extending
  const dismissWarning = useCallback(() => {
    setIsWarningActive(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Debounced activity handler
  const handleActivity = useCallback(() => {
    if (!enabled || !trackActivity || isWarningActive) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTimeRef.current;

    // Only reset if enough time has passed (debounce)
    if (timeSinceLastActivity < activityDebounce) return;

    if (activityDebounceRef.current) {
      clearTimeout(activityDebounceRef.current);
    }

    activityDebounceRef.current = setTimeout(() => {
      resetSessionTimer();
    }, 100);

    lastActivityTimeRef.current = now;
  }, [
    enabled,
    trackActivity,
    isWarningActive,
    activityDebounce,
    resetSessionTimer,
  ]);

  // Initialize session on mount
  useEffect(() => {
    if (!enabled) return;

    startSession();

    return () => {
      clearAllTimers();
    };
  }, [enabled, startSession, clearAllTimers]); // Only run on mount and when enabled changes

  // Set up activity event listeners
  useEffect(() => {
    if (!enabled || !trackActivity) return;

    // Add event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, trackActivity, handleActivity]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    // State
    isWarningActive,
    remainingSeconds,
    isExpired,
    timeUntilWarning,
    expiresAt,
    lastActivityAt,

    // Actions
    extendSession,
    resetSessionTimer,
    expireSession,
    dismissWarning,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format remaining seconds as MM:SS
 */
export function formatRemainingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculate progress percentage for countdown (0-100)
 */
export function calculateCountdownProgress(
  remainingSeconds: number,
  totalWarningSeconds: number
): number {
  if (totalWarningSeconds === 0) return 0;
  return Math.max(
    0,
    Math.min(100, (remainingSeconds / totalWarningSeconds) * 100)
  );
}
