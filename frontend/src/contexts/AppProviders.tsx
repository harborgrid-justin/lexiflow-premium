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

import { ThemeProvider } from '@/features/theme';
import { CaseProvider } from './case/CaseContext';
import { DataSourceProvider } from './data/DataSourceContext';
import { SyncProvider } from './sync/SyncContext';
import { ToastProvider as ToastProviderBase, useToast } from './toast/ToastContext';
import { WindowProvider } from './window/WindowContext';
import React from "react";

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
  // Map the full theme to the subset required by WindowProvider
  // Using semantic Tailwind classes that map to CSS variables
  const windowTheme = {
    surface: {
      default: 'bg-surface',
      muted: 'bg-surface',
    },
    border: {
      default: 'border-border',
    },
    accent: {
      primary: 'bg-primary',
    },
    text: {
      secondary: 'text-text-muted',
      tertiary: 'text-text-muted',
    },
    interactive: {
      hover: 'hover:bg-surface',
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
          <CaseProvider>
            <SyncProviderWithToast>
              <WindowProviderWithTheme>
                {children}
              </WindowProviderWithTheme>
            </SyncProviderWithToast>
          </CaseProvider>
        </DataSourceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
