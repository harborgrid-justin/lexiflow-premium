/**
 * Litigation Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { LitigationProvider } from './LitigationProvider';
import { LitigationView } from './LitigationView';
import type { LitigationLoaderData } from './loader';

export function LitigationPage() {
  const initialData = useLoaderData() as LitigationLoaderData;

  return (
    <LitigationProvider initialData={initialData}>
      <LitigationView />
    </LitigationProvider>
  );
}

export default LitigationPage;
