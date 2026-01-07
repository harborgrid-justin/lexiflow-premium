/**
 * SessionProvider - Session Lifecycle Management
 *
 * Enterprise pattern: Session = cookie presence, not token storage
 *
 * Responsibilities:
 * - Track session state (active/expired)
 * - Monitor session health
 * - Provide session metadata to UI
 *
 * Does NOT handle:
 * - Token refresh (backend auto-refreshes via cookie rotation)
 * - Token storage (httpOnly cookies, inaccessible to JS)
 * - Auth headers (transport layer handles this)
 *
 * @module services/session/SessionProvider
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface SessionContextValue {
  /** Whether session is active (cookie present and valid) */
  isActive: boolean;
  /** Whether session check is in progress */
  isChecking: boolean;
  /** Session metadata from last check */
  lastChecked: Date | null;
  /** Check session validity */
  checkSession: () => Promise<boolean>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    // Check session on mount
    checkSession();

    // Periodically check session (every 5 minutes)
    const interval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Check if session is active
   *
   * Makes lightweight request to backend.
   * Backend validates session via cookie.
   */
  const checkSession = async (): Promise<boolean> => {
    setIsChecking(true);

    try {
      // Make lightweight health check that requires auth
      const response = await fetch('/api/health', {
        credentials: 'include', // Include cookie
      });

      const active = response.ok;
      setIsActive(active);
      setLastChecked(new Date());

      return active;
    } catch (error) {
      console.error('Session check failed:', error);
      setIsActive(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const value: SessionContextValue = {
    isActive,
    isChecking,
    lastChecked,
    checkSession,
  };
};

return (
  <SessionContext.Provider value={value}>
    {children}
  </SessionContext.Provider>
);
}
