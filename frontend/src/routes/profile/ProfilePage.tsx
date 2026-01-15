/**
 * Profile Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { ProfileLoaderData } from './loader';
import { ProfileProvider } from './ProfileProvider';
import { ProfileView } from './ProfileView';

export function ProfilePage() {
  const initialData = useLoaderData() as ProfileLoaderData;

  return (
    <ProfileProvider initialData={initialData}>
      <ProfileView />
    </ProfileProvider>
  );
}

export default ProfilePage;
