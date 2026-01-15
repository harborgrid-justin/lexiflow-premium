/**
 * ================================================================================
 * INFRASTRUCTURE LAYER - FOUNDATIONAL SERVICES
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + React Router v7 + Context + Suspense
 *
 * POSITION: OUTERMOST LAYER
 *
 * LAYERING HIERARCHY (OUTER → INNER):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ InfrastructureErrorProvider  (Error boundary)               │
 * │  └─ EnvProvider              (Environment config)           │
 * │     └─ ConfigProvider        (App configuration)            │
 * │        └─ UtilityProvider    (Helper functions)             │
 * │           └─ ThemeProvider   (Visual system)                │
 * │              └─ ToastProvider (Notifications)               │
 * │                 └─ QueryClientProvider (Data cache)         │
 * │                    └─ SessionProvider (Session mgmt)        │
 * │                       └─ WebSocketProvider (Real-time)      │
 * └─────────────────────────────────────────────────────────────┘
 *
 * RESPONSIBILITIES:
 * ═══════════════════════════════════════════════════════════════
 * • Environment detection and configuration
 * • Visual theming (light/dark mode, density, tokens)
 * • Global UI feedback mechanisms (toasts, notifications)
 * • Data caching infrastructure (React Query client)
 * • Session lifecycle and timeout management
 * • Utility functions (formatting, validation, etc.)
 * • Application-wide configuration
 * • WebSocket connection management
 * • Infrastructure-level error boundaries
 *
 * CRITICAL RULES (NON-NEGOTIABLE):
 * ═══════════════════════════════════════════════════════════════
 * 1. NO business logic - infrastructure only
 * 2. NO API calls - configuration and setup only
 * 3. NO authentication/authorization - that's Application layer
 * 4. NO domain state - no case, document, or user data
 * 5. SSR-safe - no localStorage reads in render
 * 6. Concurrent-safe - all values deeply immutable
 * 7. Memoized context values - prevent unnecessary re-renders
 * 8. No dependencies on Application or Domain layers
 *
 * ENTERPRISE INVARIANTS:
 * ═══════════════════════════════════════════════════════════════
 * • Context values are stable and memoized
 * • Providers are idempotent (StrictMode compatible)
 * • All state updates are immutable
 * • No render-phase side effects
 * • Cleanup functions for all effects
 * • Error boundaries isolate failures
 * • No assumptions about subtree structure
 *
 * @module providers/infrastructure
 */

import { ToastContainer } from '@/components/organisms/notifications/Toast';
import React from "react";
import { ConfigProvider } from './configprovider';
import { EnvProvider } from './envprovider';
import { InfrastructureErrorProvider } from './errorprovider';
import { QueryClientProvider } from './queryprovider';
import { SessionProvider } from './sessionprovider';
import { ThemeProvider } from './themeprovider';
import { ToastProvider } from './toastprovider';
import { UtilityProvider } from './utilityprovider';
import { WebSocketProvider } from './websocketprovider';

interface InfrastructureLayerProps {
  children: React.ReactNode;
}

export function InfrastructureLayer({ children }: InfrastructureLayerProps) {
  return (
    <InfrastructureErrorProvider>
      <EnvProvider>
        <ConfigProvider>
          <UtilityProvider>
            <ThemeProvider>
              <ToastProvider>
                <QueryClientProvider>
                  <SessionProvider autoRefresh={true} inactivityTimeout={30}>
                    <WebSocketProvider autoConnect={false}>
                      {children}
                      <ToastContainer />
                    </WebSocketProvider>
                  </SessionProvider>
                </QueryClientProvider>
              </ToastProvider>
            </ThemeProvider>
          </UtilityProvider>
        </ConfigProvider>
      </EnvProvider>
    </InfrastructureErrorProvider>
  );
}
