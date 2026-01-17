/**
 * Billing Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/billing
 */

import { createContext } from "react";

import type { BillingActionsValue, BillingStateValue } from "./types";

export const BillingStateContext = createContext<BillingStateValue | null>(
  null
);
BillingStateContext.displayName = "BillingStateContext";

export const BillingActionsContext = createContext<BillingActionsValue | null>(
  null
);
BillingActionsContext.displayName = "BillingActionsContext";
