/**
 * Evidence Management Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { EvidenceProvider } from './EvidenceProvider';
import { EvidenceView } from './EvidenceView';

export function EvidencePage() {
  return (
    <EvidenceProvider>
      <EvidenceView />
    </EvidenceProvider>
  );
}

export default EvidencePage;
