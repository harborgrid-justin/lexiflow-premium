/**
 * Compliance Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/compliance
 */

import { createContext } from "react";

import type { ComplianceActionsValue, ComplianceStateValue } from "./types";

export const ComplianceStateContext =
  createContext<ComplianceStateValue | null>(null);
ComplianceStateContext.displayName = "ComplianceStateContext";

export const ComplianceActionsContext =
  createContext<ComplianceActionsValue | null>(null);
ComplianceActionsContext.displayName = "ComplianceActionsContext";
