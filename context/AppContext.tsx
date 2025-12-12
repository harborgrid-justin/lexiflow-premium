/**
 * App Context
 * Global application state management including settings, theme, and preferences
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AppSettings {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  display: {
    density: 'comfortable' | 'compact' | 'spacious';
    animations: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
  };
}

export interface AppState {
  isOnline: boolean;
  lastSyncTime: number | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  updateAvailable: boolean;
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
}

interface AppContextType {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // App state
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  updateAppState: (state: Partial<AppState>) => void;

  // Feature flags
  isFeatureEnabled: (feature: string) => boolean;
  enableFeature: (feature: string) => void;
  disableFeature: (feature: string) => void;

  // Theme mode (integrating with ThemeContext)
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;

  // Network status
  isOnline: boolean;

  // Performance monitoring
  recordMetric: (metric: string, value: number) => void;
  getMetrics: () => Record<string, number[]>;
}

const defaultSettings: AppSettings = {
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    desktop: true,
    sound: true,
  },
  display: {
    density: 'comfortable',
    animations: true,
    reducedMotion: false,
  },
  privacy: {
    analytics: true,
    crashReports: true,
  },
};

const defaultAppState: AppState = {
  isOnline: navigator.onLine,
  lastSyncTime: null,
  syncStatus: 'idle',
  updateAvailable: false,
  maintenanceMode: false,
  featureFlags: {},
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persist settings to localStorage
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);
  const [darkMode, setDarkModeState] = useLocalStorage<boolean>('dark-mode', false);

  // App runtime state (not persisted)
  const [appState, setAppState] = useState<AppState>(defaultAppState);

  // Performance metrics
  const [metrics, setMetrics] = useState<Record<string, number[]>>({});

  // Update settings (partial update)
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      notifications: {
        ...prev.notifications,
        ...(newSettings.notifications || {}),
      },
      display: {
        ...prev.display,
        ...(newSettings.display || {}),
      },
      privacy: {
        ...prev.privacy,
        ...(newSettings.privacy || {}),
      },
    }));
  }, [setSettings]);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, [setSettings]);

  // Update app state (partial update)
  const updateAppState = useCallback((newState: Partial<AppState>) => {
    setAppState(prev => ({
      ...prev,
      ...newState,
      featureFlags: {
        ...prev.featureFlags,
        ...(newState.featureFlags || {}),
      },
    }));
  }, []);

  // Feature flag helpers
  const isFeatureEnabled = useCallback((feature: string): boolean => {
    return appState.featureFlags[feature] === true;
  }, [appState.featureFlags]);

  const enableFeature = useCallback((feature: string) => {
    updateAppState({
      featureFlags: {
        ...appState.featureFlags,
        [feature]: true,
      },
    });
  }, [appState.featureFlags, updateAppState]);

  const disableFeature = useCallback((feature: string) => {
    updateAppState({
      featureFlags: {
        ...appState.featureFlags,
        [feature]: false,
      },
    });
  }, [appState.featureFlags, updateAppState]);

  // Dark mode helpers
  const toggleDarkMode = useCallback(() => {
    setDarkModeState(prev => !prev);
  }, [setDarkModeState]);

  const setDarkMode = useCallback((enabled: boolean) => {
    setDarkModeState(enabled);
  }, [setDarkModeState]);

  // Performance monitoring
  const recordMetric = useCallback((metric: string, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: [...(prev[metric] || []), value].slice(-100), // Keep last 100 values
    }));
  }, []);

  const getMetrics = useCallback(() => metrics, [metrics]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => updateAppState({ isOnline: true });
    const handleOffline = () => updateAppState({ isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateAppState]);

  // Apply reduced motion preference
  useEffect(() => {
    if (settings.display.reducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [settings.display.reducedMotion]);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AppContextType>(() => ({
    settings,
    updateSettings,
    resetSettings,
    appState,
    setAppState,
    updateAppState,
    isFeatureEnabled,
    enableFeature,
    disableFeature,
    darkMode,
    toggleDarkMode,
    setDarkMode,
    isOnline: appState.isOnline,
    recordMetric,
    getMetrics,
  }), [
    settings,
    updateSettings,
    resetSettings,
    appState,
    setAppState,
    updateAppState,
    isFeatureEnabled,
    enableFeature,
    disableFeature,
    darkMode,
    toggleDarkMode,
    setDarkMode,
    recordMetric,
    getMetrics,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
