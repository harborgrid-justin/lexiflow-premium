/**
 * Environment Contexts
 *
 * React contexts for environment configuration.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/env/contexts
 */

import { createContext } from "react";

import type { EnvConfig } from "./types";

/**
 * Environment Context
 *
 * Provides read-only access to environment variables and runtime config.
 */
export const EnvContext = createContext<EnvConfig | undefined>(undefined);

EnvContext.displayName = "EnvContext";
