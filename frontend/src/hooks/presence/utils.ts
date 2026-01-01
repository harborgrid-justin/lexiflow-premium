/**
 * Presence Utilities
 * @module hooks/presence/utils
 */

import { PresenceStatus, PresenceStatusDisplay } from './types';

/**
 * Get color, label, and icon for presence status display.
 */
export function getPresenceStatusDisplay(status: PresenceStatus): PresenceStatusDisplay {
  switch (status) {
    case PresenceStatus.ONLINE:
      return { color: 'green', label: 'Online', icon: '●' };
    case PresenceStatus.AWAY:
      return { color: 'yellow', label: 'Away', icon: '◐' };
    case PresenceStatus.BUSY:
      return { color: 'red', label: 'Busy', icon: '⊖' };
    case PresenceStatus.OFFLINE:
      return { color: 'gray', label: 'Offline', icon: '○' };
    default:
      return { color: 'gray', label: 'Unknown', icon: '?' };
  }
}

/**
 * Format last seen time as relative string.
 */
export function formatLastSeen(lastSeen: string): string {
  const date = new Date(lastSeen);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
