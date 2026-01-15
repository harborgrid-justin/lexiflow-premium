/**
 * Communications Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/communications
 */

import { createContext } from "react";
import type {
  CommunicationsActionsValue,
  CommunicationsStateValue,
} from "./types";

export const CommunicationsStateContext =
  createContext<CommunicationsStateValue | null>(null);
CommunicationsStateContext.displayName = "CommunicationsStateContext";

export const CommunicationsActionsContext =
  createContext<CommunicationsActionsValue | null>(null);
CommunicationsActionsContext.displayName = "CommunicationsActionsContext";
