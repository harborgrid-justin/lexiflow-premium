/**
 * Utility Contexts
 * React context definitions for utility functions
 *
 * @module lib/utility/contexts
 */

import { createContext } from "react";

import type { UtilityValue } from "./types";

export const UtilityContext = createContext<UtilityValue | null>(null);
UtilityContext.displayName = "UtilityContext";
