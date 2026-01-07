/**
 * Session domain model
 */

export interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  createdAt: string;
  metadata?: SessionMetadata;
}

export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
}

export function isSessionExpired(session: Session): boolean {
  return new Date(session.expiresAt) <= new Date();
}

export function getTimeUntilExpiry(session: Session): number {
  const expiresAt = new Date(session.expiresAt);
  const now = new Date();
  return Math.max(0, expiresAt.getTime() - now.getTime());
}
