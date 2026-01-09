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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/shadcn/alert-dialog"
import { Progress } from "@/components/ui/shadcn/progress"
import { Button } from "@/components/ui/shadcn/button"
import { AlertTriangle } from 'lucide-react';

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

    const handleSessionWarning = (event: Event) => {
      const customEvent = event as CustomEvent<{ remainingTime: number }>;
      const remainingTime = customEvent.detail?.remainingTime || defaultWarningDuration * 1000;
      const remainingSecs = Math.floor(remainingTime / 1000);

      setInternalIsOpen(true);
      startCountdown(remainingSecs);
    };

    window.addEventListener(SESSION_WARNING_EVENT, handleSessionWarning);

    return () => {
      window.removeEventListener(SESSION_WARNING_EVENT, handleSessionWarning);
    };
  }, [isControlled, defaultWarningDuration, startCountdown]);

  // Clean up countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className={`sm:max-w-md ${className}`}>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <p className="text-foreground">
              Your session will expire in{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formattedTime}
              </span>{' '}
              due to inactivity.
            </p>
            <p>
              Would you like to stay signed in? Click "Stay Signed In" to extend your session.
            </p>
            <Progress value={progressPercent} className="h-2" />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out Now
          </Button>
          <Button onClick={handleExtend} className="bg-blue-600 hover:bg-blue-700 text-white">
            Stay Signed In
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default SessionTimeoutWarning;
