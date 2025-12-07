
import React from 'react';
import { DiscoveryPlatform } from '../DiscoveryPlatform';

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