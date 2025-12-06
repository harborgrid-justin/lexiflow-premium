import React from 'react';
import { DiscoveryRequests } from '../discovery/DiscoveryRequests';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { DataService } from '../../services/dataService';
import { DiscoveryRequest } from '../../types';
import { Loader2 } from 'lucide-react';

interface CaseDiscoveryProps {
  caseId: string;
}

export const CaseDiscovery: React.FC<CaseDiscoveryProps> = ({ caseId }) => {
  // Use useQuery to fetch case-specific discovery requests
  const { data: caseRequests = [], isLoading } = useQuery<DiscoveryRequest[]>(
    [STORES.REQUESTS, caseId],
    () => DataService.discovery.getRequests(caseId)
  );

  const handleNavigate = (view: string, id?: string) => {
      const req = caseRequests.find(r => r.id === id);
      alert(`Action: ${view} for request: ${req?.title || id}`);
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-6 w-6"/></div>;

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
