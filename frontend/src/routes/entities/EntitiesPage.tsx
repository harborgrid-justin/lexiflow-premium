/**
 * Entities Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { EntitiesProvider } from './EntitiesProvider';
import { EntitiesView } from './EntitiesView';
import type { EntitiesLoaderData } from './loader';

export function EntitiesPage() {
  const initialData = useLoaderData() as EntitiesLoaderData;

  return (
    <EntitiesProvider initialData={initialData}>
      <EntitiesView />
    </EntitiesProvider>
  );
}

export default EntitiesPage;
