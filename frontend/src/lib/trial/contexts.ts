/**
 * Trial Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/trial
 */

import { createContext } from "react";
import type { TrialActionsValue, TrialStateValue } from "./types";

export const TrialStateContext = createContext<TrialStateValue | null>(null);
TrialStateContext.displayName = "TrialStateContext";

export const TrialActionsContext = createContext<TrialActionsValue | null>(
  null
);
TrialActionsContext.displayName = "TrialActionsContext";
