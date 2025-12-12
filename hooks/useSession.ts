/**
 * useSession Hook
 * Custom hook for managing user session state and monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionService } from '../services/auth/sessionService';
import { tokenService } from '../services/auth/tokenService';
import { refreshAccessToken } from '../services/api/authService';

interface UseSessionResult {
  isActive: boolean;
  timeRemaining: number | null;
  expiresAt: number | null;
  extendSession: () => void;
  refreshSession: () => Promise<void>;
  isRefreshing: boolean;
  warningShown: boolean;
  showWarning: () => void;
  dismissWarning: () => void;
}

const SESSION_WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
const AUTO_REFRESH_THRESHOLD = 5 * 60; // Auto-refresh 5 minutes before expiry

export const useSession = (): UseSessionResult => {
  const [isActive, setIsActive] = useState(sessionService.isActive());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update session state
   */
  const updateSessionState = useCallback(() => {
    const active = sessionService.isActive();
    const remaining = sessionService.getTimeRemaining();
    const expiry = sessionService.getExpiryTime();

    setIsActive(active);
    setTimeRemaining(remaining);
    setExpiresAt(expiry);

    // Show warning if session is about to expire
    if (remaining !== null && remaining > 0 && remaining < SESSION_WARNING_THRESHOLD && !warningShown) {
      setWarningShown(true);
    }

    // Auto-refresh if token is expiring soon
    if (tokenService.isTokenExpiringSoon() && !isRefreshing) {
      refreshSession();
    }
  }, [warningShown, isRefreshing]);

  /**
   * Extend session
   */
  const extendSession = useCallback(() => {
    sessionService.extendSession();
    setWarningShown(false);
    updateSessionState();
  }, [updateSessionState]);

  /**
   * Refresh session with new token
   */
  const refreshSession = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshAccessToken();
      sessionService.extendSession();
      setWarningShown(false);
      updateSessionState();
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // Session refresh failed, user will need to log in again
      setIsActive(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, updateSessionState]);

  /**
   * Show warning manually
   */
  const showWarning = useCallback(() => {
    setWarningShown(true);
  }, []);

  /**
   * Dismiss warning
   */
  const dismissWarning = useCallback(() => {
    setWarningShown(false);
  }, []);

  /**
   * Setup session monitoring
   */
  useEffect(() => {
    // Initial state update
    updateSessionState();

    // Start periodic session check
    intervalRef.current = setInterval(() => {
      updateSessionState();
    }, SESSION_CHECK_INTERVAL);

    // Listen for activity events to extend session
    const handleActivity = () => {
      if (sessionService.isActive()) {
        sessionService.updateActivity();
      }
    };

    // Activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateSessionState]);

  /**
   * Listen for session end events
   */
  useEffect(() => {
    const handleSessionEnd = () => {
      setIsActive(false);
    };

    window.addEventListener('auth:logout', handleSessionEnd);
    return () => {
      window.removeEventListener('auth:logout', handleSessionEnd);
    };
  }, []);

  return {
    isActive,
    timeRemaining,
    expiresAt,
    extendSession,
    refreshSession,
    isRefreshing,
    warningShown,
    showWarning,
    dismissWarning,
  };
};

export default useSession;
