/**
 * Session Provider Types
 * Type definitions for session management context
 *
 * @module lib/session/types
 */

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  lastActivity: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    browser: string;
  };
}

export interface SessionStateValue {
  session: Session | null;
  isActive: boolean;
  isExpired: boolean;
  timeRemaining: number | null;
  isLoading: boolean;
  error: Error | null;
}

export interface SessionActionsValue {
  createSession: (
    userId: string,
    token: string,
    expiresIn: number
  ) => Promise<void>;
  refreshSession: () => Promise<void>;
  extendSession: (additionalTime: number) => Promise<void>;
  endSession: () => Promise<void>;
  updateActivity: () => void;
}

export interface SessionProviderProps {
  children: React.ReactNode;
  autoRefresh?: boolean;
  inactivityTimeout?: number;
}
