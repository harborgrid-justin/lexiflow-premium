import React from 'react';
import { EvidenceInventory } from '../evidence/EvidenceInventory';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { DataService } from '../../services/dataService';
import { EvidenceItem } from '../../types';
import { Loader2 } from 'lucide-react';

interface CaseEvidenceProps {
  caseId: string;
}

export const CaseEvidence: React.FC<CaseEvidenceProps> = ({ caseId }) => {
  // Use useQuery to fetch case-specific evidence
  const { data: caseEvidence = [], isLoading } = useQuery<EvidenceItem[]>(
    [STORES.EVIDENCE, caseId],
    () => DataService.evidence.getByCaseId(caseId)
  );

  // Still need all items for the inventory component's context, though it only displays filtered
  const { data: allEvidence = [] } = useQuery<EvidenceItem[]>(
    [STORES.EVIDENCE, 'all'],
    DataService.evidence.getAll
  );
  
  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-6 w-6"/></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Case Evidence</h3>
      {caseEvidence.length === 0 ? (
        <p className="text-slate-500 italic">No evidence logged for this case.</p>
      ) : (
        <EvidenceInventory 
          items={allEvidence} 
          filteredItems={caseEvidence} 
          filters={{ search: '', type: '', admissibility: '', caseId: '', custodian: '', dateFrom: '', dateTo: '', location: '', tags: '', collectedBy: '', hasBlockchain: false }}
          setFilters={() => {}} // No-op for read-only view in case detail context
          onItemClick={(item) => alert(`Viewing details for ${item.title} (Nav to Vault for full details)`)}
          onIntakeClick={() => alert("Please go to Evidence Vault to log new items.")}
        />
      )}
    </div>
  );
};
