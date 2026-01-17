/**
 * CRMPage Component
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * Responsibility: Suspense boundary and async resolution management
 * Pattern: Page → Suspense → Await → View
 *
 * This component:
 * - Manages Suspense boundaries for async data
 * - Resolves deferred promises with Await
 * - Delegates to ClientCRM for presentation
 *
 * @see routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Await } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { ClientCRM } from './components/ClientCRM';

import type { loader } from './index';

interface CRMPageProps {
  loaderData: Awaited<ReturnType<typeof loader>>;
}

export function CRMPage({ loaderData }: CRMPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading CRM" />}>
      <Await resolve={loaderData.clients} errorElement={<RouteError title="Failed to load CRM" />}>
        {(clients) => <ClientCRM initialClients={clients} />}
      </Await>
    </Suspense>
  );
}
