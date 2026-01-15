/**
 * DAF (Document Assembly Framework) Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { DAFProvider } from './DAFProvider';
import { DAFView } from './DAFView';
import type { DAFLoaderData } from './loader';

export function DAFPage() {
  const initialData = useLoaderData() as DAFLoaderData;

  return (
    <DAFProvider initialData={initialData}>
      <DAFView />
    </DAFProvider>
  );
}

export default DAFPage;
