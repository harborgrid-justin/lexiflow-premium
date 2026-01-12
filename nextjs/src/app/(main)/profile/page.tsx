/**
 * Profile Page - Server Component with Data Fetching
 * Fetches user profile from backend
 */
import React from 'react';
import UserProfileManager from '@/components/profile/UserProfileManager';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Profile | LexiFlow',
  description: 'User Profile',
};

export default async function ProfilePage(): Promise<React.JSX.Element> {
  // Fetch current user profile
  let userProfile = null;

  try {
    userProfile = await apiFetch(API_ENDPOINTS.AUTH.ME);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading profile...</div>}>
        <UserProfileManager initialProfile={userProfile} />
      </Suspense>
    </div>
  );
}
