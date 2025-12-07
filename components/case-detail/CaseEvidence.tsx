import React from 'react';
import { EvidenceInventory } from '../evidence/EvidenceInventory';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { DataService } from '../../services/dataService';
import { EvidenceItem } from '../../types';
import { Loader2 } from 'lucide-react';
import { useEvidenceVault } from '../../hooks/useEvidenceVault'; // Import useEvidenceVault

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
  
  // Use a simplified version of useEvidenceVault to provide necessary props
  const { filters, setFilters, handleItemClick, handleIntakeComplete } = useEvidenceVault(caseId);

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-6 w-6"/></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Case Evidence</h3>
      {caseEvidence.length === 0 ? (
        <p className="text-slate-500 italic">No evidence logged for this case.</p>
      ) : (
        <EvidenceInventory
          items={allEvidence} // Pass all evidence for search context if needed
          filteredItems={caseEvidence} // Pass case-specific items for display initially
          filters={filters}
          setFilters={setFilters}
          // FIX: Correct the onItemClick prop type to match the expected function signature
          onItemClick={handleItemClick}
          onIntakeClick={() => alert("Please go to Evidence Vault to log new items.")}
        />
      )}
    </div>
  );
};