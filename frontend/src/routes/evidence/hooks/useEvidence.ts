/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useContext } from "react";
import { EvidenceContext } from "../EvidenceContext";

/**
 * useEvidence Hook
 *
 * Thin adapter around EvidenceContext.
 * Provides access to evidence data, metrics, and filter state.
 *
 * @throws Error if used outside EvidenceProvider
 */
export function useEvidence() {
  const context = useContext(EvidenceContext);
  if (!context) {
    throw new Error("useEvidence must be used within EvidenceProvider");
  }
  return context;
}
