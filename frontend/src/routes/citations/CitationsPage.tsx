/**
 * Citations Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { CitationsProvider } from './CitationsProvider';
import { CitationsView } from './CitationsView';
import type { CitationsLoaderData } from './loader';

export function CitationsPage() {
  const initialData = useLoaderData() as CitationsLoaderData;

  return (
    <CitationsProvider initialData={initialData}>
      <CitationsView />
    </CitationsProvider>
  );
}

export default CitationsPage;
