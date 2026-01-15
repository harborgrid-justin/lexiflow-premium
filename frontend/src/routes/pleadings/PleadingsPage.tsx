/**
 * Pleadings Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { PleadingsLoaderData } from './loader';
import { PleadingsProvider } from './PleadingsProvider';
import { PleadingsView } from './PleadingsView';

export function PleadingsPage() {
  const initialData = useLoaderData() as PleadingsLoaderData;

  return (
    <PleadingsProvider initialData={initialData}>
      <PleadingsView />
    </PleadingsProvider>
  );
}

export default PleadingsPage;
