// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - CONFIGURATION (INFRASTRUCTURE)
// ================================================================================

/**
 * Configuration Provider - Infrastructure Layer
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + SSR-Safe + Concurrent Features
 *
 * RESPONSIBILITIES:
 * • Application configuration (API URLs, timeouts, limits)
 * • Environment detection (dev, staging, production)
 * • Feature toggles (basic infrastructure flags)
 * • Integration settings (external services)
 * • Runtime configuration management
 *
 * REACT 18 PATTERNS:
 * ✓ Split state/actions contexts
 * ✓ Memoized values and callbacks
 * ✓ SSR-safe (no side effects in render)
 * ✓ StrictMode compatible
 * ✓ Immutable state updates
 *
 * LOADER INTEGRATION:
 * • Can receive initialConfig from root loader
 * • Hydrates from environment variables
 * • Falls back to defaults
 *
 * DISTINCTION FROM FlagsProvider:
 * • ConfigProvider: Infrastructure settings (API URLs, limits)
 * • FlagsProvider: Business feature flags (A/B tests, rollouts)
 *
 * @module providers/infrastructure/configprovider
 */

import { startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ConfigActionsContext, ConfigStateContext } from '@/lib/config/contexts';

import type { AppConfig, ConfigActionsValue, ConfigProviderProps, ConfigStateValue } from '@/lib/config/types';

const DEFAULT_CONFIG: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiTimeout: 30000,
  maxUploadSize: 100 * 1024 * 1024, // 100MB
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  environment: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  features: {
    aiAssistant: true,
    advancedSearch: true,
    bulkOperations: true,
    exportPdf: true,
    realTimeSync: true,
  },
  limits: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFilesPerUpload: 10,
    maxConcurrentUploads: 3,
  },
  integrations: {
    googleDrive: false,
    dropbox: false,
    onedrive: false,
  },
};

export function ConfigProvider({ children, initialConfig }: ConfigProviderProps) {
  const [config, setConfig] = useState<AppConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In production, fetch from API or remote config service
      const stored = localStorage.getItem('lexiflow-app-config');
      if (stored) {
        const loadedConfig = JSON.parse(stored) as Partial<AppConfig>;
        setConfig((prev) => ({ ...prev, ...loadedConfig }));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load config'));
      console.error('[ConfigProvider] Failed to load config:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = { ...config, ...updates };
      setConfig(updated);
      // Persist to localStorage (NON-URGENT - could use transition)
      startTransition(() => {
        try {
          localStorage.setItem('lexiflow-app-config', JSON.stringify(updated));
        } catch (err) {
          console.error('[ConfigProvider] Failed to persist config:', err);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update config'));
      console.error('[ConfigProvider] Failed to update config:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('lexiflow-app-config');
  }, []);

  const isFeatureEnabled = useCallback((featureName: string): boolean => {
    return config.features[featureName] === true;
  }, [config.features]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const stateValue = useMemo<ConfigStateValue>(() => ({
    config,
    isLoading,
    error,
  }), [config, isLoading, error]);

  const actionsValue = useMemo<ConfigActionsValue>(() => ({
    loadConfig,
    updateConfig,
    resetConfig,
    isFeatureEnabled,
  }), [loadConfig, updateConfig, resetConfig, isFeatureEnabled]);

  return (
    <ConfigStateContext.Provider value={stateValue}>
      <ConfigActionsContext.Provider value={actionsValue}>
        {children}
      </ConfigActionsContext.Provider>
    </ConfigStateContext.Provider>
  );
}

export function useConfigState(): ConfigStateValue {
  const context = useContext(ConfigStateContext);
  if (!context) {
    throw new Error('useConfigState must be used within ConfigProvider');
  }
  return context;
}

export function useConfigActions(): ConfigActionsValue {
  const context = useContext(ConfigActionsContext);
  if (!context) {
    throw new Error('useConfigActions must be used within ConfigProvider');
  }
  return context;
}

export function useConfig() {
  return {
    state: useConfigState(),
    actions: useConfigActions(),
  };
}
