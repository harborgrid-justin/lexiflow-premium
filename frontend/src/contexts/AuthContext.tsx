// ================================================================================
// LEGACY AUTH CONTEXT SHIM
// ================================================================================
//
// This file re-exports the enterprise AuthProvider for backward compatibility.
// New code should import directly from '@/contexts/auth/AuthProvider'
//
// DEPRECATED: Import from '@/contexts/auth/AuthProvider' instead
//
// ================================================================================

/**
 * Legacy AuthContext shim.
 *
 * The enterprise AuthProvider lives in ./auth/AuthProvider. This file
 * re-exports that implementation to preserve backward compatibility
 * for modules that still import from '@/contexts/AuthContext'.
 */

export { AuthProvider, useAuth, useAuthActions, useAuthState } from './auth/AuthProvider';
export type { AuthActionsValue, AuthStateValue, AuthUser } from './auth/authTypes';
