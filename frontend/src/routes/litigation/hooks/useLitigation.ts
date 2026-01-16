/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useContext } from "react";
import { LitigationContext } from "../LitigationContext";

/**
 * useLitigation Hook
 *
 * Thin adapter around LitigationContext.
 * Provides access to litigation matters, metrics, and filter state.
 *
 * @throws Error if used outside LitigationProvider
 */
export function useLitigation() {
  const context = useContext(LitigationContext);
  if (!context) {
    throw new Error("useLitigation must be used within LitigationProvider");
  }
  return context;
}
