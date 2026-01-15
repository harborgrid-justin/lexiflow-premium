/**
 * Jurisdiction Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { JurisdictionProvider } from './JurisdictionProvider';
import { JurisdictionView } from './JurisdictionView';
import type { JurisdictionLoaderData } from './loader';

export function JurisdictionPage() {
  const initialData = useLoaderData() as JurisdictionLoaderData;
  return (
    <JurisdictionProvider initialData={initialData}>
      <JurisdictionView />
    </JurisdictionProvider>
  );
}

export default JurisdictionPage;
