
import React from 'react';
import { MOCK_DISCOVERY } from '../../data/mockDiscovery';
import { DiscoveryRequests } from '../discovery/DiscoveryRequests';

interface CaseDiscoveryProps {
  caseId: string;
}

export const CaseDiscovery: React.FC<CaseDiscoveryProps> = ({ caseId }) => {
  const caseRequests = MOCK_DISCOVERY.filter(r => r.caseId === caseId);

  const handleNavigate = (view: string, id?: string) => {
      const req = caseRequests.find(r => r.id === id);
      alert(`Action: ${view} for request: ${req?.title || id}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Discovery Requests</h3>
      {caseRequests.length === 0 ? (
        <p className="text-slate-500 italic">No discovery requests found for this case.</p>
      ) : (
        <DiscoveryRequests 
            items={caseRequests}
            onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};
