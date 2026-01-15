/**
 * useAuth Hook
 *
 * Convenience hook that exports auth context functionality
 * Re-exports from AuthContext for backward compatibility
 */

export type { AuthUser } from "@/lib/auth/types";
export {
  useAuth,
  useAuthActions,
  useAuthState,
} from "@/providers/application/AuthProvider";
