/**
 * Profile Domain - State Provider
 */

import type { ExtendedUserProfile } from '@/types/system';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';
import type { ProfileLoaderData } from './loader';

export type ProfileTab = 'overview' | 'settings' | 'security' | 'access';

interface ProfileContextValue {
  profile: ExtendedUserProfile | null;
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as ProfileLoaderData;
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const contextValue = useMemo<ProfileContextValue>(() => ({
    profile: loaderData.profile,
    activeTab,
    setActiveTab,
  }), [loaderData.profile, activeTab]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
