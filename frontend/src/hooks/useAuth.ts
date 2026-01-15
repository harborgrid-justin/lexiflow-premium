/**
 * Authentication Hooks
 *
 * Custom hooks for accessing auth state and actions.
 * Separated from AuthProvider to maintain Fast Refresh compatibility.
 *
 * @module providers/authHooks
 */

import { AuthActionsContext, AuthStateContext } from "@/lib/auth/contexts";
import type { AuthActionsValue, AuthStateValue } from "@/lib/auth/types";
import { useContext } from "react";

/**
 * Access authentication state
 * @throws Error if used outside AuthProvider
 */
export function useAuthState(): AuthStateValue {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthState must be used within an AuthProvider");
  }
  return context;
}

/**
 * Access authentication actions
 * @throws Error if used outside AuthProvider
 */
export function useAuthActions(): AuthActionsValue {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return context;
}

/**
 * Convenience hook for accessing both state and actions
 * Use sparingly - prefer specific hooks for better performance
 */
export function useAuth() {
  return {
    ...useAuthState(),
    ...useAuthActions(),
  };
}
