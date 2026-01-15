/**
 * ================================================================================
 * LAYOUT PROVIDER - GLOBAL LAYOUT STATE PROVIDER
 * ================================================================================
 *
 * RESPONSIBILITIES:
 * - Wraps LayoutContext provider for global layout state
 * - Integrates with provider layering system
 *
 * ENTERPRISE PATTERN:
 * - Provider in providers/ for global access
 * - Uses LayoutContext for state management
 * - No JSX layout, only provider wrapper
 *
 * @module providers/LayoutProvider
 */

import { LayoutProvider as LayoutContextProvider } from "@/unknown_fix_me/LayoutProvider";
import { ReactNode } from 'react';

export interface LayoutProviderProps {
  children: ReactNode;
}

/**
 * Layout Provider
 * Provides global layout state management
 */
export function LayoutProvider({ children }: LayoutProviderProps) {
  return (
    <LayoutContextProvider>
      {children}
    </LayoutContextProvider>
  );
}

export default LayoutProvider;
