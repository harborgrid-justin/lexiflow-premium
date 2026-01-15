/**
 * Clauses Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { ClausesProvider } from './ClausesProvider';
import { ClausesView } from './ClausesView';
import type { ClausesLoaderData } from './loader';

export function ClausesPage() {
  const initialData = useLoaderData() as ClausesLoaderData;

  return (
    <ClausesProvider initialData={initialData}>
      <ClausesView />
    </ClausesProvider>
  );
}

export default ClausesPage;
