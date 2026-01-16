/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Settings Page Component
 *
 * Handles Suspense/Await wiring for settings route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/settings/SettingsPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { SettingsProvider } from './SettingsProvider';
import { SettingsView } from './SettingsView';
import type { SettingsLoaderData } from './loader';

interface SettingsPageProps {
  loaderData: SettingsLoaderData;
}

export function SettingsPage({ loaderData }: SettingsPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Settings" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Settings" />}>
        {(resolved) => (
          <SettingsProvider initialData={resolved}>
            <SettingsView />
          </SettingsProvider>
        )}
      </Await>
    </Suspense>
  );
}
