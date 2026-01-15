/**
 * ================================================================================
 * LAYOUT PROVIDER - APPLICATION LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Layout State Management
 *
 * RESPONSIBILITIES:
 * • Global layout state (sidebar, panels, windows)
 * • Layout preferences (collapsed, expanded)
 * • Window/panel configurations
 * • Responsive layout adjustments
 * • Holographic routing support (window dock)
 *
 * REACT 18 PATTERNS:
 * ✓ Memoized layout state
 * ✓ Transition support for layout changes
 * ✓ LocalStorage persistence
 * ✓ SSR-safe
 * ✓ StrictMode compatible
 *
 * CROSS-CUTTING CAPABILITY:
 * • StateProvider manages sidebar state
 * • LayoutProvider manages panel configurations
 * • ThemeProvider affects layout density
 *
 * INTEGRATION:
 * • Uses holographic routing for window management
 * • Persists layout preferences
 * • Responsive to theme density changes
 *
 * ENTERPRISE INVARIANTS:
 * • No business logic
 * • Only layout concerns
 * • Observable state
 * • User preference driven
 *
 * @module providers/application/layoutprovider
 */

import { LayoutProvider as LayoutContextProvider } from "@/unknown_fix_me/LayoutProvider";
import { ReactNode } from 'react';

export interface LayoutProviderProps {
  children: ReactNode;
}

/**
 * Layout Provider
 * Provides global layout state management for application-level UI
 */
export function LayoutProvider({ children }: LayoutProviderProps) {
  return (
    <LayoutContextProvider>
      {children}
    </LayoutContextProvider>
  );
}

export default LayoutProvider;
