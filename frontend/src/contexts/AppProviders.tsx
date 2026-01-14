/**
 * AppProviders - Composed Provider Tree (Enterprise Architecture v7)
 *
 * ARCHITECTURE LAYERING (Per Enterprise Standard):
 * ========================================
 * OUTER → INFRASTRUCTURE (Theme, Toast, QueryClient)
 * MID   → APPLICATION     (Auth, Entitlements, Flags)
 * INNER → DOMAIN          (Loaded per route)
 *
 * This file contains ONLY global/app-level providers.
 * Domain-specific providers (Case, Data, Window, Sync) are loaded
 * within their respective route components.
 *
 * Dependency Graph:
 * - ThemeProvider (infrastructure - no dependencies)
 * - ToastProvider (infrastructure - no dependencies)
 * - AuthProvider (app-level - no dependencies)
 * - EntitlementsProvider (app-level - depends on Auth)
 * - FlagsProvider (app-level - no dependencies)
 *
 * Best Practices Applied:
 * - BP1: Provider composition avoids circular imports
 * - BP3: Dependency injection pattern for cross-provider communication
 * - BP13: Document provider dependencies
 * - Enterprise Standard: Domain contexts in routes, not here
 */

import { ThemeProvider } from '@/theme';
import React from "react";
import { AuthProvider } from './auth/AuthProvider';
import { EntitlementsProvider } from './entitlements/EntitlementsContext';
import { FlagsProvider } from './flags/FlagsContext';
import { ToastProvider as ToastProviderBase } from './toast/ToastContext';

// Wrapper to ensure ToastProvider returns ReactNode
const ToastProvider = ToastProviderBase as unknown as React.FC<{
  children: React.ReactNode;
  maxVisible?: number;
  maxQueue?: number;
}>;

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Composed provider tree following Enterprise Architecture Standard
 *
 * LAYERING (OUTER → INNER):
 * 1. ThemeProvider       - Infrastructure (CSS variables, dark/light mode)
 * 2. ToastProvider       - Infrastructure (global notifications)
 * 3. AuthProvider        - App-level (authentication state)
 * 4. EntitlementsProvider - App-level (permissions, plans)
 * 5. FlagsProvider       - App-level (feature flags, config)
 *
 * IMPORTANT: Domain contexts (CaseProvider, DataProvider, WindowProvider, SyncProvider)
 * are NOT here. They are loaded within their respective route components:
 * - CaseProvider → /routes/cases/CasePage.tsx
 * - DataProvider → /routes/dashboard/DashboardPage.tsx
 * - WindowProvider → /routes/_shared (loaded per route as needed)
 * - SyncProvider → /routes/_shared (loaded per route as needed)
 *
 * This follows the Enterprise Standard:
 *   ROUTER = STATE MACHINE
 *   CONTEXT = DOMAIN LAYER (per route)
 *   GLOBAL CONTEXTS = APP-LEVEL ONLY
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider maxVisible={5} maxQueue={50}>
        <AuthProvider>
          <EntitlementsProvider>
            <FlagsProvider>
              {children}
            </FlagsProvider>
          </EntitlementsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
