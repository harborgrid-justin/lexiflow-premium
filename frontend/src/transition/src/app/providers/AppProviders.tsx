/**
 * AppProviders - Single source of truth for provider nesting order
 * This is the ONLY place where provider composition is declared
 */

import { StrictMode, type ReactNode } from 'react';
import { ConfigProvider } from '../../platform/config/ConfigProvider';
import { I18nProvider } from '../../platform/i18n/I18nProvider';
import { ErrorBoundaryProvider } from '../../platform/observability/ErrorBoundaryProvider';
import { ThemeProvider } from '../../platform/theme/ThemeProvider';
import { DataProvider } from '../../services/data/DataProvider';
import { AuthProvider } from '../../services/identity/AuthProvider';
import { SessionProvider } from '../../services/session/SessionProvider';
import { StateProvider } from '../../services/state/StateProvider';
import { LayoutProvider } from '../layout/LayoutProvider';
import { RouterProvider } from '../routing/RouterProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Provider nesting order (outer → inner):
 * 1. StrictMode - React development checks
 * 2. ErrorBoundary - Top-level error handling
 * 3. Config - Feature flags and environment configuration
 * 4. Theme - Design tokens and theme switching
 * 5. I18n - Internationalization and localization
 * 6. Auth - Identity and authentication
 * 7. Session - Session lifecycle and token management
 * 8. State - Global state management
 * 9. Data - Central data management and caching
 * 10. Router - Navigation and routing
 * 11. Layout - Layout structure and chrome
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StrictMode>
      <ErrorBoundaryProvider>
        <ConfigProvider>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <SessionProvider>
                  <StateProvider>
                    <DataProvider>
                      <RouterProvider>
                        <LayoutProvider>
                          {children}
                        </LayoutProvider>
                      </RouterProvider>
                    </DataProvider>
                  </StateProvider>
                </SessionProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </ConfigProvider>
      </ErrorBoundaryProvider>
    </StrictMode>
  );
}
