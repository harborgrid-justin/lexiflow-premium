/**
 * Profile Domain - State Provider
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useLoaderData } from 'react-router';
import type { ProfileLoaderData } from './loader';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  avatar?: string;
  bio?: string;
};

interface ProfileContextValue {
  profile: UserProfile | null;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as ProfileLoaderData;

  const contextValue = useMemo<ProfileContextValue>(() => ({
    profile: loaderData.profile,
  }), [loaderData.profile]);

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
