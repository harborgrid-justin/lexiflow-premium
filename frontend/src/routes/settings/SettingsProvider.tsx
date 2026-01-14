/**
 * Settings Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';
import type { SettingsLoaderData } from './loader';

type SystemSetting = {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'security' | 'notifications' | 'integrations';
  description: string;
};

interface SettingsState {
  settings: SystemSetting[];
  activeTab: 'general' | 'security' | 'notifications' | 'integrations';
}

interface SettingsContextValue extends SettingsState {
  setActiveTab: (tab: 'general' | 'security' | 'notifications' | 'integrations') => void;
  getSettingsByCategory: (category: string) => SystemSetting[];
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as SettingsLoaderData;

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'integrations'>('general');

  const getSettingsByCategory = useCallback((category: string) => {
    return loaderData.settings.filter(s => s.category === category);
  }, [loaderData.settings]);

  const contextValue = useMemo<SettingsContextValue>(() => ({
    settings: loaderData.settings,
    activeTab,
    setActiveTab,
    getSettingsByCategory,
  }), [loaderData.settings, activeTab, getSettingsByCategory]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
