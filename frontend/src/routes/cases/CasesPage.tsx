/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Cases Page Component
 *
 * Handles Suspense/Await wiring for cases list route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/cases/CasesPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { CaseListProvider } from './CaseListProvider';
import CaseListView from './CaseListView';

import type { CaseListLoaderData } from './loader';

interface CasesPageProps {
  loaderData: CaseListLoaderData;
}

export function CasesPage({ loaderData }: CasesPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Cases" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Cases" />}>
        {(resolved) => (
          <CaseListProvider
            initialCases={resolved.cases}
            initialInvoices={resolved.invoices}
          >
            <CaseListView />
          </CaseListProvider>
        )}
      </Await>
    </Suspense>
  );
}
