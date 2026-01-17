/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Audit Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { AuditProvider } from './AuditProvider';
import { AuditView } from './AuditView';

import type { AuditLoaderData } from './loader';

export function AuditPage() {
  const initialData = useLoaderData();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Audit" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Audit" />}>
        {(resolved) => (
          <AuditProvider initialData={resolved}>
            <AuditView />
          </AuditProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default AuditPage;
