/**
 * AppProviders - Composed Provider Tree
 *
 * This file composes all application providers in the correct dependency order
 * to prevent circular dependencies. Providers are layered from most primitive
 * (Theme) to most dependent (Window, Sync).
 *
 * Dependency Graph:
 * - ThemeProvider (no dependencies)
 * - ToastProvider (no dependencies)
 * - DataSourceProvider (no dependencies)
 * - WindowProvider (depends on Theme)
 * - SyncProvider (depends on Toast)
 *
 * Best Practices Applied:
 * - BP1: Provider composition avoids circular imports
 * - BP3: Dependency injection pattern for cross-provider communication
 * - BP13: Document provider dependencies
 */

import React from 'react';
import { DataSourceProvider } from './DataSourceProvider';
import { SyncProvider } from './SyncProvider';
import { useTheme } from './ThemeHooks';
import { ThemeProvider } from './ThemeProvider';
import { useToast } from './ToastHooks';
import { ToastProvider as ToastProviderBase } from './ToastProvider';
import { WindowProvider } from './WindowProvider';

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
 * Internal wrapper that connects WindowProvider to ThemeContext
 * This avoids circular dependency by keeping the connection isolated
 */
function WindowProviderWithTheme({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  // Map the full theme to the subset required by WindowProvider
  const windowTheme = {
    surface: {
      default: theme.surface.default,
      muted: theme.surface.raised,
    },
    border: {
      default: theme.border.default,
    },
    accent: {
      primary: theme.primary.DEFAULT,
    },
    text: {
      secondary: theme.text.secondary,
      tertiary: theme.text.tertiary,
    },
    interactive: {
      hover: theme.surface.highlight,
    },
  };
  return <WindowProvider theme={windowTheme}>{children}</WindowProvider>;
}

/**
 * Internal wrapper that connects SyncProvider to ToastContext
 * This avoids circular dependency by keeping the connection isolated
 */
function SyncProviderWithToast({ children }: { children: React.ReactNode }) {
  const { success, error } = useToast();
  return (
    <SyncProvider onSyncSuccess={success} onSyncError={error}>
      {children}
    </SyncProvider>
  );
}

/**
 * Composed provider tree with proper dependency injection
 *
 * Order matters:
 * 1. ThemeProvider - base layer (no deps)
 * 2. ToastProvider - base layer (no deps)
 * 3. DataSourceProvider - base layer (no deps)
 * 4. WindowProviderWithTheme - needs Theme
 * 5. SyncProviderWithToast - needs Toast
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider maxVisible={5} maxQueue={50}>
        <DataSourceProvider>
          <WindowProviderWithTheme>
            <SyncProviderWithToast>
              {children}
            </SyncProviderWithToast>
          </WindowProviderWithTheme>
        </DataSourceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
