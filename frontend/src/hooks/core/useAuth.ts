/**
 * useAuth Hook
 *
 * Convenience hook that exports auth context functionality
 * Re-exports from AuthContext for backward compatibility
 */

export { useAuth, useAuthState, useAuthActions } from '@/contexts/auth/AuthProvider';
export type { AuthUser } from '@/contexts/auth/authTypes';
