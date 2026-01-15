// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - SESSION MANAGEMENT (INFRASTRUCTURE)
// ================================================================================

/**
 * Session Provider - Infrastructure Layer
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Concurrent Features + SSR-Safe
 *
 * RESPONSIBILITIES:
 * • Session lifecycle management (create, refresh, extend, end)
 * • Token refresh automation
 * • Activity tracking
 * • Inactivity timeout detection
 * • Session expiration handling
 *
 * REACT 18 PATTERNS:
 * ✓ Split state/actions contexts (performance)
 * ✓ Memoized context values (stability)
 * ✓ Cleanup functions for all effects
 * ✓ StrictMode compatible (idempotent)
 * ✓ SSR-safe (no localStorage in render)
 *
 * ENTERPRISE INVARIANTS:
 * • No business logic (infrastructure only)
 * • No authentication decisions (that's AuthProvider)
 * • Pure session lifecycle management
 * • Observable state changes
 * • Deterministic behavior
 *
 * @module providers/infrastructure/sessionprovider
 */

import { SessionActionsContext, SessionStateContext } from '@/lib/session/contexts';
import type { Session, SessionActionsValue, SessionProviderProps, SessionStateValue } from '@/lib/session/types';
import { startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function SessionProvider({
  children,
  autoRefresh = true,
  inactivityTimeout = 30 * 60 * 1000 // 30 minutes
}: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const isActive = useMemo(() => session !== null, [session]);

  const isExpired = useMemo(() => {
    if (!session) return false;
    return new Date(session.expiresAt).getTime() < Date.now();
  }, [session]);

  const timeRemaining = useMemo(() => {
    if (!session) return null;
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [session]);

  const createSession = useCallback(async (
    userId: string,
    token: string,
    expiresIn: number
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession: Session = {
        id: `session_${Date.now()}`,
        userId,
        token,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        lastActivity: new Date().toISOString(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          browser: navigator.userAgent.match(/Chrome|Firefox|Safari|Edge/)?.[0] || 'Unknown'
        }
      };
      setSession(newSession);
      setLastActivity(Date.now());
      localStorage.setItem('lexiflow-session', JSON.stringify(newSession));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create session'));
      console.error('[SessionProvider] Failed to create session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!session) return;

    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would call an API to refresh the token
      const refreshedSession: Session = {
        ...session,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
        lastActivity: new Date().toISOString()
      };
      setSession(refreshedSession);
      localStorage.setItem('lexiflow-session', JSON.stringify(refreshedSession));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh session'));
      console.error('[SessionProvider] Failed to refresh session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const extendSession = useCallback(async (additionalTime: number): Promise<void> => {
    if (!session) return;

    setIsLoading(true);
    setError(null);
    try {
      const extendedSession: Session = {
        ...session,
        expiresAt: new Date(new Date(session.expiresAt).getTime() + additionalTime * 1000).toISOString(),
        lastActivity: new Date().toISOString()
      };
      setSession(extendedSession);
      localStorage.setItem('lexiflow-session', JSON.stringify(extendedSession));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to extend session'));
      console.error('[SessionProvider] Failed to extend session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const endSession = useCallback(async (): Promise<void> => {
    setSession(null);
    localStorage.removeItem('lexiflow-session');
    setLastActivity(Date.now());
  }, []);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);

    // Debounce session updates to avoid excessive localStorage writes
    if (session) {
      // Only update if more than 30 seconds since last update
      const lastUpdateTime = new Date(session.lastActivity).getTime();
      if (now - lastUpdateTime > 30000) {
        const updatedSession = {
          ...session,
          lastActivity: new Date(now).toISOString()
        };
        setSession(updatedSession);
        // Use transition for non-urgent localStorage write
        startTransition(() => {
          localStorage.setItem('lexiflow-session', JSON.stringify(updatedSession));
        });
      }
    }
  }, [session]);

  // Auto-refresh session when it's about to expire
  useEffect(() => {
    if (!autoRefresh || !session || isExpired) return;

    const timeUntilExpiry = new Date(session.expiresAt).getTime() - Date.now();
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry

    if (timeUntilExpiry < refreshThreshold && timeUntilExpiry > 0) {
      refreshSession();
    }

    const interval = setInterval(() => {
      const remaining = new Date(session.expiresAt).getTime() - Date.now();
      if (remaining < refreshThreshold && remaining > 0) {
        refreshSession();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [autoRefresh, session, isExpired, refreshSession]);

  // Inactivity timeout
  useEffect(() => {
    if (!session || !inactivityTimeout) return;

    const checkInactivity = () => {
      if (Date.now() - lastActivity > inactivityTimeout) {
        console.warn('[SessionProvider] Session ended due to inactivity');
        endSession();
      }
    };

    const interval = setInterval(checkInactivity, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [session, lastActivity, inactivityTimeout, endSession]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('lexiflow-session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Session;
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          setSession(parsed);
        } else {
          localStorage.removeItem('lexiflow-session');
        }
      } catch (err) {
        console.error('[SessionProvider] Failed to restore session:', err);
        localStorage.removeItem('lexiflow-session');
      }
    }
  }, []); // Empty deps - only run once on mount

  // Cleanup on unmount (StrictMode compatible)
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      if (typeof window !== 'undefined') {
        // Save current session state before unmount
        if (session) {
          try {
            localStorage.setItem('lexiflow-session', JSON.stringify(session));
          } catch (err) {
            console.error('[SessionProvider] Failed to save session on unmount:', err);
          }
        }
      }
    };
  }, [session]);

  const stateValue = useMemo<SessionStateValue>(() => ({
    session,
    isActive,
    isExpired,
    timeRemaining,
    isLoading,
    error,
  }), [session, isActive, isExpired, timeRemaining, isLoading, error]);

  const actionsValue = useMemo<SessionActionsValue>(() => ({
    createSession,
    refreshSession,
    extendSession,
    endSession,
    updateActivity,
  }), [createSession, refreshSession, extendSession, endSession, updateActivity]);

  return (
    <SessionStateContext.Provider value={stateValue}>
      <SessionActionsContext.Provider value={actionsValue}>
        {children}
      </SessionActionsContext.Provider>
    </SessionStateContext.Provider>
  );
}

export function useSessionState(): SessionStateValue {
  const context = useContext(SessionStateContext);
  if (!context) {
    throw new Error('useSessionState must be used within SessionProvider');
  }
  return context;
}

export function useSessionActions(): SessionActionsValue {
  const context = useContext(SessionActionsContext);
  if (!context) {
    throw new Error('useSessionActions must be used within SessionProvider');
  }
  return context;
}

export function useSession() {
  return {
    state: useSessionState(),
    actions: useSessionActions(),
  };
}
