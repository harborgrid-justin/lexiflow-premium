/**
 * useAuth Hook
 *
 * Convenience hook that exports auth context functionality
 * Re-exports from AuthContext for backward compatibility
 */

export { useAuth, useAuthState, useAuthActions } from '@/contexts/AuthContext';
export type { AuthUser, Organization } from '@/contexts/AuthContext';
