/**
 * Exhibits Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { ExhibitsProvider } from './ExhibitsProvider';
import { ExhibitsView } from './ExhibitsView';
import type { ExhibitsLoaderData } from './loader';

export function ExhibitsPage() {
  const initialData = useLoaderData() as ExhibitsLoaderData;

  return (
    <ExhibitsProvider initialData={initialData}>
      <ExhibitsView />
    </ExhibitsProvider>
  );
}

export default ExhibitsPage;
