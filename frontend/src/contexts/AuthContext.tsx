/**
 * Legacy AuthContext shim.
 *
 * The enterprise AuthProvider lives in ./auth/AuthProvider. This file
 * re-exports that implementation to preserve backward compatibility
 * for modules that still import from '@/contexts/AuthContext'.
 */

export { AuthProvider, useAuth, useAuthActions, useAuthState } from './auth/AuthProvider';
export type { AuthUser, AuthActionsValue, AuthStateValue } from './auth/authTypes';
