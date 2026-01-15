/**
 * Reports & Analytics Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { ReportsLoaderData } from './loader';
import { ReportsProvider } from './ReportsProvider';
import { ReportsView } from './ReportsView';

export function ReportsPage() {
  return (
    <ReportsProvider initialData={useLoaderData() as ReportsLoaderData}>
      <ReportsView />
    </ReportsProvider>
  );
}

export default ReportsPage;
