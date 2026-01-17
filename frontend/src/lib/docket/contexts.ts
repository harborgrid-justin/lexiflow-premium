/**
 * Docket Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/docket
 */

import { createContext } from "react";

import type { DocketActionsValue, DocketStateValue } from "./types";

export const DocketStateContext = createContext<DocketStateValue | null>(null);
DocketStateContext.displayName = "DocketStateContext";

export const DocketActionsContext = createContext<DocketActionsValue | null>(
  null
);
DocketActionsContext.displayName = "DocketActionsContext";
