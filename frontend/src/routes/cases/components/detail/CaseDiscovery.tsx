/**
 * CaseDiscovery.tsx
 *
 * Case-scoped discovery platform wrapper embedding the full DiscoveryPlatform
 * component with case-specific context.
 *
 * @module components/case-detail/CaseDiscovery
 * @category Case Management - Discovery
 */

// External Dependencies
// Internal Dependencies - Components
import React from 'react';

import { DiscoveryPlatform } from '@/routes/discovery/components/platform/DiscoveryPlatform';

interface CaseDiscoveryProps {
  caseId: string;
}

export const CaseDiscovery: React.FC<CaseDiscoveryProps> = ({ caseId }) => {
  return (
    <div className="h-full -mx-6 -my-6">
      {/* Embed the full platform but scoped to this case */}
      <DiscoveryPlatform caseId={caseId} />
    </div>
  );
};
