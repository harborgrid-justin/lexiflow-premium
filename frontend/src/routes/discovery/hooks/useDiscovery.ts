/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useContext } from "react";

import { DiscoveryContext } from "../DiscoveryContext";

/**
 * useDiscovery Hook
 *
 * Thin adapter around DiscoveryContext.
 * Provides access to discovery evidence, requests, productions, and metrics.
 *
 * @throws Error if used outside DiscoveryProvider
 */
export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error("useDiscovery must be used within DiscoveryProvider");
  }
  return context;
}
