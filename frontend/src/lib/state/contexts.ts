/**
 * Global State Contexts
 * React context definitions for global application state
 *
 * @module lib/state/contexts
 */

import { createContext } from "react";
import type { StateActionsValue, StateValue } from "./types";

export const GlobalStateContext = createContext<StateValue | null>(null);
GlobalStateContext.displayName = "GlobalStateContext";

export const GlobalStateActionsContext =
  createContext<StateActionsValue | null>(null);
GlobalStateActionsContext.displayName = "GlobalStateActionsContext";
