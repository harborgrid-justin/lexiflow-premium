/**
 * Configuration Contexts
 * React context definitions for app configuration
 *
 * @module lib/config/contexts
 */

import { createContext } from "react";
import type { ConfigActionsValue, ConfigStateValue } from "./types";

export const ConfigStateContext = createContext<ConfigStateValue | null>(null);
ConfigStateContext.displayName = "ConfigStateContext";

export const ConfigActionsContext = createContext<ConfigActionsValue | null>(
  null
);
ConfigActionsContext.displayName = "ConfigActionsContext";
