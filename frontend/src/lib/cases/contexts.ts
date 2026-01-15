/**
 * Cases Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/cases
 */

import { createContext } from "react";
import type { CasesActionsValue, CasesStateValue } from "./types";

export const CasesStateContext = createContext<CasesStateValue | null>(null);
CasesStateContext.displayName = "CasesStateContext";

export const CasesActionsContext = createContext<CasesActionsValue | null>(
  null
);
CasesActionsContext.displayName = "CasesActionsContext";
