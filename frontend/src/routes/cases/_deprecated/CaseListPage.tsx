/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Case List Page - Data Orchestration Layer
 *
 * ENTERPRISE ARCHITECTURE PATTERN:
 * - Provider initialization with loader data
 * - Clean separation of data and presentation
 *
 * RESPONSIBILITY:
 * - Data orchestration (useLoaderData)
 * - Provider setup
 * - NO presentation logic
 *
 * @module routes/cases/CaseListPage
 */

import { Suspense } from 'react';
import { Await, useLoaderData, useRevalidator } from 'react-router';

import { RouteError, TableRouteSkeleton } from '../_shared/RouteSkeletons';

import { CaseListProvider } from './CaseListProvider';
import { CaseListView } from './CaseListView';

/**
 * Page component - handles data orchestration
 *
 * DATA FLOW:
 * 1. Router loader fetches data (parallel)
 * 2. Suspense boundary (rendering concern)
 * 3. Await resolves deferred data (data concern)
 * 4. Provider initializes with resolved data (domain layer)
 * 5. View renders pure presentation (UI layer)
 */
export function CaseListPageContent() {
  const data = useLoaderData<typeof import('./loader').clientLoader>();
  const revalidator = useRevalidator();

  return (
    <div className="min-h-full">
      <Suspense fallback={<TableRouteSkeleton title="Loading Cases" />}>
        <Await resolve={data} errorElement={<RouteError title="Failed to load cases" />}>
          {(resolved) => (
            <CaseListProvider
              initialCases={resolved.cases}
              initialInvoices={resolved.invoices}
              onRevalidate={revalidator.revalidate}
            >
              <CaseListView />
            </CaseListProvider>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
