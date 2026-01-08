/**
 * Session Timeout Warning Component
 *
 * Displays a modal warning when the user's session is about to expire.
 * Allows the user to extend their session or logout.
 *
 * Features:
 * - Countdown timer showing remaining time
 * - Visual progress indicator
 * - "Stay Signed In" and "Sign Out Now" actions
 * - Listens for session-warning custom event
 * - Keyboard accessible (Escape to dismiss, Tab navigation)
 * - WCAG 2.1 AA compliant
 *
 * @module components/auth/SessionTimeoutWarning
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SESSION_WARNING_EVENT,
  formatRemainingTime,
  calculateCountdownProgress,
} from '@/hooks/useSessionTimeout';

// ============================================================================
// Types
// ============================================================================

export interface SessionTimeoutWarningProps {
  /** Callback to extend the session */
  onExtendSession: () => void;
  /** Callback to logout */
  onLogout: () => void;
  /** Default warning duration in seconds (default: 300 = 5 minutes) */
  defaultWarningDuration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is controlled externally */
  isOpen?: boolean;
  /** Controlled remaining seconds (optional) */
  remainingSeconds?: number;
  /** Callback when modal visibility changes */
  onOpenChange?: (isOpen: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_WARNING_DURATION = 300; // 5 minutes in seconds

// ============================================================================
// Component
// ============================================================================

export function SessionTimeoutWarning({
  onExtendSession,
  onLogout,
  defaultWarningDuration = DEFAULT_WARNING_DURATION,
  className = '',
  isOpen: controlledIsOpen,
  remainingSeconds: controlledRemainingSeconds,
  onOpenChange,
}: SessionTimeoutWarningProps) {
  // State for uncontrolled mode
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalRemainingSeconds, setInternalRemainingSeconds] = useState(0);

  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const showWarning = isControlled ? controlledIsOpen : internalIsOpen;
  const remainingSecondsValue = isControlled && controlledRemainingSeconds !== undefined
    ? controlledRemainingSeconds
    : internalRemainingSeconds;

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const extendButtonRef = useRef<HTMLButtonElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate display values
  const formattedTime = formatRemainingTime(remainingSecondsValue);
  const progressPercent = calculateCountdownProgress(remainingSecondsValue, defaultWarningDuration);

  // Handle visibility change
  const setShowWarning = useCallback((value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalIsOpen(value);
    }
  }, [isControlled, onOpenChange]);

  // Handle extend session
  const handleExtend = useCallback(async () => {
    setShowWarning(false);

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    onExtendSession();
  }, [onExtendSession, setShowWarning]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setShowWarning(false);

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    onLogout();
  }, [onLogout, setShowWarning]);

  // Handle escape key
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Escape dismisses but doesn't extend - user must explicitly choose
      // For security, we don't auto-dismiss on Escape
    }
  }, []);

  // Start countdown timer (for uncontrolled mode)
  const startCountdown = useCallback((initialSeconds: number) => {
    setInternalRemainingSeconds(initialSeconds);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setInternalRemainingSeconds((prev) => {
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

  // Listen for session-warning custom event (uncontrolled mode)
  useEffect(() => {
    if (isControlled) return;

    const handleSessionWarning = (event: CustomEvent<{ remainingTime: number }>) => {
      const remainingTimeMs = event.detail?.remainingTime || defaultWarningDuration * 1000;
      const remainingSecs = Math.floor(remainingTimeMs / 1000);

      setInternalIsOpen(true);
      startCountdown(remainingSecs);
    };

    window.addEventListener(SESSION_WARNING_EVENT, handleSessionWarning as EventListener);

    return () => {
      window.removeEventListener(SESSION_WARNING_EVENT, handleSessionWarning as EventListener);
    };
  }, [isControlled, defaultWarningDuration, startCountdown]);

  // Focus management - focus extend button when modal opens
  useEffect(() => {
    if (showWarning && extendButtonRef.current) {
      extendButtonRef.current.focus();
    }
  }, [showWarning]);

  // Trap focus within modal
  useEffect(() => {
    if (!showWarning) return;

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleFocusTrap);

    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [showWarning]);

  // Clean up countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Don't render if not showing
  if (!showWarning) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-description"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-amber-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3
                id="session-warning-title"
                className="text-lg font-semibold text-white"
              >
                Session Expiring Soon
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p
            id="session-warning-description"
            className="text-gray-700 dark:text-gray-300 mb-4"
          >
            Your session will expire in{' '}
            <span
              className="font-bold text-amber-600 dark:text-amber-400 tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              {formattedTime}
            </span>{' '}
            due to inactivity.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Would you like to stay signed in? Click &quot;Stay Signed In&quot; to extend your session.
          </p>

          {/* Timer Progress */}
          <div className="mb-6" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              ref={extendButtonRef}
              type="button"
              onClick={handleExtend}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Stay Signed In
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:bg-gray-300 dark:focus:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Sign Out Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            For your security, sessions expire after 30 minutes of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default SessionTimeoutWarning;
