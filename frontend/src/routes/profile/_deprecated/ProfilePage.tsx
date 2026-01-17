/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Profile Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { ProfileProvider } from './ProfileProvider';
import { ProfileView } from './ProfileView';

import type { ProfileLoaderData } from './loader';

export function ProfilePage() {
  const initialData = useLoaderData() as ProfileLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Profile" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Profile" />}>
        {(resolved) => (
          <ProfileProvider initialData={resolved}>
            <ProfileView />
          </ProfileProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default ProfilePage;
