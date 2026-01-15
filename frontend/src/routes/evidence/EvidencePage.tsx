/**
 * Evidence Management Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { useLoaderData } from 'react-router';
import { EvidenceProvider } from './EvidenceProvider';
import { EvidenceView } from './EvidenceView';
import type { EvidenceLoaderData } from './loader';

export function EvidencePage() {
  const initialData = useLoaderData() as EvidenceLoaderData;

  return (
    <EvidenceProvider initialData={initialData}>
      <EvidenceView />
    </EvidenceProvider>
  );
}

export default EvidencePage;
