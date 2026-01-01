/**
 * Presence Types
 * @module hooks/presence/types
 */

/** User Presence Status */
export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

/** User Presence Information */
export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
  activeConnections: number;
  currentActivity?: string;
  customStatus?: string;
  timestamp?: string;
}

/** Presence Options */
export interface PresenceOptions {
  namespace?: string;
  enabled?: boolean;
  heartbeatInterval?: number;
  onPresenceUpdate?: (presence: UserPresence) => void;
}

/** Presence Status Display */
export interface PresenceStatusDisplay {
  color: string;
  label: string;
  icon: string;
}
