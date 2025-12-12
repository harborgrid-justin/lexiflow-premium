/**
 * Root Provider
 * Composes all context providers in the correct order
 */

import React, { ReactNode } from 'react';

// Import all providers
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';
import { ToastProvider } from './ToastContext';
import { NotificationProvider } from './NotificationContext';
import { DataProvider, CacheConfig } from './DataContext';
import { SearchProvider } from './SearchContext';
import { BreadcrumbProvider } from './BreadcrumbContext';
import { LoadingProvider } from './LoadingContext';
import { PermissionProvider, RolePermissions } from './PermissionContext';
import { ModalProvider } from './ModalContext';
import { SidebarProvider } from './SidebarContext';
import { WebSocketProvider } from './WebSocketContext';
import { CaseProvider } from './CaseContext';
import { FilterProvider } from './FilterContext';
import { SelectionProvider } from './SelectionContext';

export interface RootProviderProps {
  children: ReactNode;

  // Configuration options for individual providers
  config?: {
    theme?: {
      defaultMode?: 'light' | 'dark';
    };
    data?: CacheConfig;
    search?: {
      debounceDelay?: number;
      maxHistoryItems?: number;
      maxRecentSearches?: number;
    };
    breadcrumb?: {
      defaultSeparator?: string;
      defaultMaxItems?: number;
      defaultShowHome?: boolean;
      homeLabel?: string;
      homePath?: string;
    };
    loading?: {
      autoCleanupAfter?: number;
    };
    permissions?: {
      roleDefinitions?: RolePermissions[];
    };
    websocket?: {
      url?: string;
      autoConnect?: boolean;
      reconnectAttempts?: number;
      reconnectInterval?: number;
    };
  };
}

/**
 * RootProvider combines all context providers in the correct dependency order:
 *
 * 1. ThemeProvider - No dependencies
 * 2. AppProvider - No dependencies
 * 3. ToastProvider - No dependencies
 * 4. NotificationProvider - Depends on ToastProvider
 * 5. DataProvider - No dependencies
 * 6. AuthProvider - No dependencies
 * 7. PermissionProvider - Depends on AuthProvider
 * 8. LoadingProvider - No dependencies
 * 9. SearchProvider - No dependencies
 * 10. BreadcrumbProvider - No dependencies
 * 11. ModalProvider - No dependencies
 * 12. SidebarProvider - No dependencies
 * 13. WebSocketProvider - Depends on AuthProvider
 * 14. CaseProvider - May depend on Auth, Data
 * 15. FilterProvider - No dependencies
 * 16. SelectionProvider - No dependencies
 */
export const RootProvider: React.FC<RootProviderProps> = ({ children, config = {} }) => {
  return (
    <ThemeProvider>
      <AppProvider>
        <ToastProvider>
          <NotificationProvider>
            <DataProvider config={config.data}>
              <AuthProvider>
                <PermissionProvider roleDefinitions={config.permissions?.roleDefinitions}>
                  <LoadingProvider autoCleanupAfter={config.loading?.autoCleanupAfter}>
                    <SearchProvider
                      debounceDelay={config.search?.debounceDelay}
                      maxHistoryItems={config.search?.maxHistoryItems}
                      maxRecentSearches={config.search?.maxRecentSearches}
                    >
                      <BreadcrumbProvider
                        defaultSeparator={config.breadcrumb?.defaultSeparator}
                        defaultMaxItems={config.breadcrumb?.defaultMaxItems}
                        defaultShowHome={config.breadcrumb?.defaultShowHome}
                        homeLabel={config.breadcrumb?.homeLabel}
                        homePath={config.breadcrumb?.homePath}
                      >
                        <ModalProvider>
                          <SidebarProvider>
                            <WebSocketProvider
                              url={config.websocket?.url}
                              autoConnect={config.websocket?.autoConnect}
                              reconnectAttempts={config.websocket?.reconnectAttempts}
                              reconnectInterval={config.websocket?.reconnectInterval}
                            >
                              <CaseProvider>
                                <FilterProvider>
                                  <SelectionProvider>
                                    {children}
                                  </SelectionProvider>
                                </FilterProvider>
                              </CaseProvider>
                            </WebSocketProvider>
                          </SidebarProvider>
                        </ModalProvider>
                      </BreadcrumbProvider>
                    </SearchProvider>
                  </LoadingProvider>
                </PermissionProvider>
              </AuthProvider>
            </DataProvider>
          </NotificationProvider>
        </ToastProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default RootProvider;
