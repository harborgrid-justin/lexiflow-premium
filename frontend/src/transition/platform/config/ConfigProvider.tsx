/**
 * ConfigProvider - Configuration and feature flags
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadFromEnv } from './load/fromEnv';
import { loadFromRequest } from './load/fromRequest';
import type { Config } from './types';

const ConfigContext = createContext<Config | null>(null);

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
}

interface ConfigProviderProps {
  children: ReactNode;
  initialConfig?: Partial<Config>;
}

export function ConfigProvider({ children, initialConfig }: ConfigProviderProps) {
  const [config, setConfig] = useState<Config>(() => {
    // Server-side: load from request context
    if (typeof window === 'undefined') {
      return {
        ...loadFromEnv(),
        ...loadFromRequest(),
        ...initialConfig,
      } as Config;
    }

    // Client-side: load from env
    return {
      ...loadFromEnv(),
      ...initialConfig,
    } as Config;
  });

  useEffect(() => {
    // Load remote feature flags if needed
    const loadRemoteConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const remoteConfig = await response.json();
        setConfig(prev => ({ ...prev, ...remoteConfig }));
      } catch (error) {
        console.error('Failed to load remote config:', error);
      }
    };

    if (config.features?.remoteConfig) {
      loadRemoteConfig();
    }
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}
