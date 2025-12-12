/**
 * Enhanced App Component with Router and Provider Integration
 * This is an alternative implementation showing route guards and lazy loading
 * To use: rename this to App.tsx (backup existing one first)
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import { routeConfig } from './router/routes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ConnectivityHUD } from './components/common/ConnectivityHUD';
import { GlobalHotkeys } from './components/common/GlobalHotkeys';

/**
 * Enhanced App Component Features:
 * - Centralized provider hierarchy (AppProvider)
 * - Route-based code splitting with lazy loading
 * - Protected routes with authentication guards
 * - Global error boundaries
 * - Connectivity monitoring
 * - Keyboard shortcuts
 */
const AppEnhanced: React.FC = () => {
  return (
    <ErrorBoundary scope="AppRoot">
      <AppProvider>
        <BrowserRouter>
          <ConnectivityHUD />
          <GlobalHotkeys
            onToggleCommand={() => console.log('Command palette toggled')}
            onNavigate={(view) => console.log('Navigate to:', view)}
          />

          <Routes>
            {routeConfig.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default AppEnhanced;
