/**
 * Data Platform Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { DataPlatformProvider } from './DataPlatformProvider';
import { DataPlatformView } from './DataPlatformView';
import type { DataPlatformLoaderData } from './loader';

export function DataPlatformPage() {
  const initialData = useLoaderData() as DataPlatformLoaderData;

  return (
    <DataPlatformProvider initialData={initialData}>
      <DataPlatformView />
    </DataPlatformProvider>
  );
}

export default DataPlatformPage;
