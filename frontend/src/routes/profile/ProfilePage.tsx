/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Profile Page Component
 *
 * Handles Suspense/Await wiring for profile route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/profile/ProfilePage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { ProfileProvider } from './components/ProfileContext';
import { UserProfile } from './components/UserProfile';

import type { ProfileLoaderData } from './loader';

interface ProfilePageProps {
  loaderData: ProfileLoaderData;
}

export function ProfilePage({ loaderData }: ProfilePageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Profile" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Profile" />}>
        {(resolved) => (
          <ProfileProvider initialData={resolved}>
            <UserProfile />
          </ProfileProvider>
        )}
      </Await>
    </Suspense>
  );
}
