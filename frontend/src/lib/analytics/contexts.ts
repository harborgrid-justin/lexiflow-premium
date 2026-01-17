/**
 * Analytics Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/analytics
 */

import { createContext } from "react";

import type { AnalyticsActionsValue, AnalyticsStateValue } from "./types";

export const AnalyticsStateContext = createContext<AnalyticsStateValue | null>(
  null
);
AnalyticsStateContext.displayName = "AnalyticsStateContext";

export const AnalyticsActionsContext =
  createContext<AnalyticsActionsValue | null>(null);
AnalyticsActionsContext.displayName = "AnalyticsActionsContext";
