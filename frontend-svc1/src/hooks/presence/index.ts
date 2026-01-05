/**
 * Presence Module - User presence tracking hooks and utilities
 * @module hooks/presence
 */

// Types
export {
  PresenceStatus,
  type UserPresence,
  type PresenceOptions,
  type PresenceStatusDisplay,
} from './types';

// Utilities
export { getPresenceStatusDisplay, formatLastSeen } from './utils';

// Hooks
export { usePresence } from './usePresence';
export { usePresenceActions } from './usePresenceActions';
export { useUserPresence } from './useUserPresence';
export { useMultiUserPresence } from './useMultiUserPresence';
