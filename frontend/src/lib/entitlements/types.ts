/**
 * Entitlements Type Definitions
 *
 * Shared types for entitlements system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/entitlements/types
 */

export type Plan = "free" | "pro" | "enterprise";

export interface Entitlements {
  plan: Plan;
  canUseAdminTools: boolean;
  maxCases: number;
  storageLimitGB: number;
}

export interface EntitlementsState {
  entitlements: Entitlements;
  isLoading: boolean;
  error: string | null;
}

export type EntitlementsAction =
  | { type: "entitlements/fetchStart" }
  | { type: "entitlements/fetchSuccess"; payload: Entitlements }
  | { type: "entitlements/fetchFailure"; payload: { error: string } }
  | { type: "entitlements/reset" };

/**
 * State value exposed to consumers
 */
export interface EntitlementsStateValue {
  entitlements: Entitlements;
  isLoading: boolean;
  error: string | null;
}

/**
 * Actions value exposed to consumers
 */
export interface EntitlementsActionsValue {
  refresh: () => Promise<void>;
  reset: () => void;
}
