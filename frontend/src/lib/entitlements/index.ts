/**
 * Entitlements Module - Public API
 *
 * @module lib/entitlements
 */

// Contexts
export {
  EntitlementsActionsContext,
  EntitlementsStateContext,
} from "./contexts";

// Types
export type {
  Entitlements,
  EntitlementsAction,
  EntitlementsActionsValue,
  EntitlementsState,
  EntitlementsStateValue,
  Plan,
} from "./types";

// Provider and hooks
export {
  EntitlementsProvider,
  useEntitlements,
  useEntitlementsActions,
  useEntitlementsState,
} from "./context";
