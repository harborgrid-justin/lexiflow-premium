/**
 * Feature Flags Type Definitions
 *
 * Shared types for feature flags system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/flags/types
 */

export interface Flags {
  enableNewDashboard: boolean;
  enableAdminTools: boolean;
  ocr: boolean;
  aiAssistant: boolean;
  realTimeSync: boolean;
}

export interface FlagsState {
  flags: Flags;
  isLoading: boolean;
  error: string | null;
}

export type FlagsAction =
  | { type: "flags/fetchStart" }
  | { type: "flags/fetchSuccess"; payload: Flags }
  | { type: "flags/fetchFailure"; payload: { error: string } }
  | { type: "flags/initialize"; payload: Partial<Flags> }
  | { type: "flags/reset" };

/**
 * State value exposed to consumers
 */
export interface FlagsStateValue {
  flags: Flags;
  isLoading: boolean;
  error: string | null;
}

/**
 * Actions value exposed to consumers
 */
export interface FlagsActionsValue {
  refresh: () => Promise<void>;
  reset: () => void;
  initialize: (flags: Partial<Flags>) => void;
}
