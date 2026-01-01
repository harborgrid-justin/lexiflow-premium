/**
 * Presence Hooks - Re-export from modular structure
 * @module hooks/usePresence
 * @deprecated Import from '@/hooks/presence' instead
 */

export {
  PresenceStatus,
  type UserPresence,
  type PresenceOptions,
  type PresenceStatusDisplay,
  getPresenceStatusDisplay,
  formatLastSeen,
  usePresence,
  useUserPresence,
  useMultiUserPresence,
} from './presence';
