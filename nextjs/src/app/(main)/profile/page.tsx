/**
 * Profile Page - Server Component with Data Fetching
 * Fetches user profile from backend
 */
import React from 'react';
import UserProfileManager from '@/components/profile/UserProfileManager';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
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
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading profile...</div>}>
        <UserProfileManager initialProfile={userProfile} />
      </Suspense>
    </div>
  );
}
