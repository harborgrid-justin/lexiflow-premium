/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Settings Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import type { SettingsLoaderData } from './loader';
import { SettingsProvider } from './SettingsProvider';
import { SettingsView } from './SettingsView';

export function SettingsPage() {
  const initialData = useLoaderData() as SettingsLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Settings" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Settings" />}>
        {(resolved) => (
          <SettingsProvider initialData={resolved}>
            <SettingsView />
          </SettingsProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default SettingsPage;
