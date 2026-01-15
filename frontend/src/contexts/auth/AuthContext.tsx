/**
 * ================================================================================
 * AUTH CONTEXT - RE-EXPORT FROM AUTH SUBFOLDER
 * ================================================================================
 *
 * Per Enterprise React Architecture Standard:
 * - This is an APP-LEVEL context (authentication state)
 * - Implementation lives in ./auth/ subfolder
 * - This file provides convenient re-export
 *
 * ARCHITECTURE:
 * /contexts/auth/
 *   ├── AuthContext.tsx    - Context definition
 *   ├── AuthProvider.tsx   - Provider component
 *   ├── authTypes.ts       - TypeScript types
 *   └── authUtils.ts       - Helper functions
 *
 * USAGE:
 * import { useAuth } from '@/contexts'
 * const { user, isAuthenticated } = useAuth();
 */

export { AuthProvider, useAuth, useAuthActions, useAuthState } from './auth/AuthProvider';
export type { AuthActionsValue, AuthStateValue, AuthUser, Organization } from './auth/authTypes';
