/**
 * Feature Flags Module - Public API
 *
 * @module lib/flags
 */

// Contexts
export { FlagsActionsContext, FlagsStateContext } from "./contexts";

// Types
export type {
  Flags,
  FlagsAction,
  FlagsActionsValue,
  FlagsState,
  FlagsStateValue,
} from "./types";

// Provider and hooks
export {
  FlagsProvider,
  useFlags,
  useFlagsActions,
  useFlagsState,
} from "./context";
export type { FlagsProviderProps } from "./context";
