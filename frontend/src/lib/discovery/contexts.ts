/**
 * Discovery Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/discovery
 */

import { createContext } from "react";

import type { DiscoveryActionsValue, DiscoveryStateValue } from "./types";

export const DiscoveryStateContext = createContext<DiscoveryStateValue | null>(
  null
);
DiscoveryStateContext.displayName = "DiscoveryStateContext";

export const DiscoveryActionsContext =
  createContext<DiscoveryActionsValue | null>(null);
DiscoveryActionsContext.displayName = "DiscoveryActionsContext";
