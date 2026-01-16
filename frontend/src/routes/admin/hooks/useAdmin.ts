/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useContext } from "react";
import { AdminContext } from "../AdminContext";

/**
 * useAdmin Hook
 *
 * Thin adapter around AdminContext.
 * Provides access to system metrics, logs, and session info.
 *
 * @throws Error if used outside AdminProvider
 */
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
