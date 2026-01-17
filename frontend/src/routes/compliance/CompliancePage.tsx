/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Compliance Page Component
 *
 * Handles Suspense/Await wiring for compliance route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/compliance/CompliancePage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { ComplianceProvider } from './ComplianceProvider';
import { ComplianceView } from './ComplianceView';

import type { ComplianceLoaderData } from './loader';

interface CompliancePageProps {
  loaderData: ComplianceLoaderData;
}

export function CompliancePage({ loaderData }: CompliancePageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Compliance" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Compliance" />}>
        {(resolved) => (
          <ComplianceProvider initialData={resolved}>
            <ComplianceView />
          </ComplianceProvider>
        )}
      </Await>
    </Suspense>
  );
}
