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

import { useLoaderData } from 'react-router';
import { CaseListProvider } from './CaseListProvider';
import { CaseListView } from './CaseListView';

/**
 * Page component - handles data orchestration
 *
 * DATA FLOW:
 * 1. Router loader fetches data (parallel)
 * 2. Provider initializes with loader data
 * 3. View renders pure presentation
 *
 * NOTE: Suspense + defer() will be added in Phase 2
 * Currently data is pre-loaded via clientLoader
 */
export function CaseListPageContent() {
  const data = useLoaderData<typeof import('./loader').clientLoader>();

  return (
    <div className="min-h-full">
      <CaseListProvider
        initialCases={data.cases}
        initialInvoices={data.invoices}
      >
        <CaseListView />
      </CaseListProvider>
    </div>
  );
}
