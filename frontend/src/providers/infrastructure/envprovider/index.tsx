/**
 * ================================================================================
 * ENVIRONMENT PROVIDER - INFRASTRUCTURE LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Read-Only Configuration
 *
 * RESPONSIBILITIES:
 * • Expose VITE_* environment variables
 * • Provide feature flag state from environment
 * • Detect runtime environment (dev/staging/prod)
 * • Read-only configuration access
 * • NO business logic
 * • NO API calls
 * • NO side effects
 *
 * REACT 18 PATTERNS:
 * ✓ Memoized configuration
 * ✓ Pure read-only state
 * ✓ SSR-safe
 * ✓ No side effects
 * ✓ Singleton pattern
 *
 * USAGE:
 * const { apiUrl, isDevelopment, features } = useEnv();
 *
 * @module providers/infrastructure/envprovider
 */

import React, { createContext, useContext, useMemo } from "react";

interface EnvConfig {
  // API Configuration
  apiUrl: string;
  wsUrl: string;

  // Environment Detection
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Feature Flags (from env)
  features: {
    enableAnalytics: boolean;
    enableDebugTools: boolean;
    enableExperimentalFeatures: boolean;
  };

  // App Metadata
  version: string;
  buildDate: string;
}

const EnvContext = createContext<EnvConfig | undefined>(undefined);

interface EnvProviderProps {
  children: React.ReactNode;
}

/**
 * Environment Provider
 * Exposes runtime configuration to the entire app
 */
export function EnvProvider({ children }: EnvProviderProps) {
  const config = useMemo<EnvConfig>(() => {
    const mode = import.meta.env.MODE || 'development';

    return {
      // API URLs
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',

      // Environment
      isDevelopment: mode === 'development',
      isProduction: mode === 'production',
      isTest: mode === 'test',

      // Feature Flags
      features: {
        enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
        enableDebugTools: import.meta.env.VITE_ENABLE_DEBUG === 'true',
        enableExperimentalFeatures: import.meta.env.VITE_ENABLE_EXPERIMENTAL === 'true',
      },

      // Metadata
      version: import.meta.env.VITE_APP_VERSION || '0.0.0',
      buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
    };
  }, []);

  return (
    <EnvContext.Provider value={config}>
      {children}
    </EnvContext.Provider>
  );
}

/**
 * Hook to access environment configuration
 * @throws {Error} if used outside EnvProvider
 */
export function useEnv(): EnvConfig {
  const context = useContext(EnvContext);
  if (!context) {
    throw new Error('useEnv must be used within EnvProvider');
  }
  return context;
}
