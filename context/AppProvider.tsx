/**
 * App Provider
 * Combined provider that wraps all context providers
 */

import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { NotificationProvider } from './NotificationContext';
import { CacheProvider } from './CacheContext';
import { SyncProvider } from './SyncContext';
import { WindowProvider } from './WindowContext';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider combines all context providers in the correct order
 * Provider hierarchy (outer to inner):
 * 1. ErrorBoundary - Catch-all error boundary
 * 2. ThemeProvider - Theme and styling
 * 3. ToastProvider - Toast notifications (dependency for NotificationProvider)
 * 4. NotificationProvider - High-level notifications
 * 5. CacheProvider - Client-side caching
 * 6. SyncProvider - Data synchronization
 * 7. WindowProvider - Window/tab management
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary scope="AppRoot">
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <CacheProvider defaultTTL={5 * 60 * 1000} maxSize={100} persistToStorage={false}>
              <SyncProvider>
                <WindowProvider>
                  {children}
                </WindowProvider>
              </SyncProvider>
            </CacheProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppProvider;
