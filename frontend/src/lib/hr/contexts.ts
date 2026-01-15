/**
 * HR Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/hr
 */

import { createContext } from "react";
import type { HRActionsValue, HRStateValue } from "./types";

export const HRStateContext = createContext<HRStateValue | null>(null);
HRStateContext.displayName = "HRStateContext";

export const HRActionsContext = createContext<HRActionsValue | null>(null);
HRActionsContext.displayName = "HRActionsContext";
