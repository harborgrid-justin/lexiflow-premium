/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useContext } from "react";

import { PleadingsContext } from "../PleadingsContext";

/**
 * usePleadings Hook
 *
 * Thin adapter around PleadingsContext.
 * Provides access to pleadings data, metrics, and filter state.
 *
 * @throws Error if used outside PleadingsProvider
 */
export function usePleadings() {
  const context = useContext(PleadingsContext);
  if (!context) {
    throw new Error("usePleadings must be used within PleadingsProvider");
  }
  return context;
}
