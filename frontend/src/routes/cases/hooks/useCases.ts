/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useContext } from "react";

import { CaseListContext } from "../CaseListContext";

/**
 * useCases Hook
 *
 * Thin adapter around CaseListContext.
 * Provides access to case list state, metrics, and actions.
 *
 * @throws Error if used outside CaseListProvider
 */
export function useCases() {
  const context = useContext(CaseListContext);
  if (!context) {
    throw new Error("useCases must be used within CaseListProvider");
  }
  return context;
}
