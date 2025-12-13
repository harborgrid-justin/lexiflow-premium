import React from 'react';
import { EvidenceInventory } from '../evidence/EvidenceInventory';
import { EvidenceItem } from '../../types';
import { Loader2 } from 'lucide-react';
import { useEvidenceVault } from '@/hooks/useEvidenceVault'; 

interface CaseEvidenceProps {
  caseId: string;
}

export const CaseEvidence: React.FC<CaseEvidenceProps> = ({ caseId }) => {
  // Use useEvidenceVault hook, scoped to the specific caseId.
  // This hook now encapsulates all data fetching and state management.
  const { 
    evidenceItems,
    filteredItems, 
    filters, 
    setFilters, 
    handleItemClick, 
    handleIntakeComplete 
  } = useEvidenceVault(caseId);

  // isLoading can be derived from the hook's underlying useQuery if needed,
  // but for simplicity we can check the items array.
  if (!evidenceItems) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-6 w-6"/></div>;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {evidenceItems.length === 0 ? (
        <p className="text-slate-500 italic text-center py-10">No evidence logged for this case.</p>
      ) : (
        <EvidenceInventory
          items={evidenceItems} 
          filteredItems={filteredItems}
          filters={filters}
          setFilters={setFilters}
          onItemClick={handleItemClick}
          onIntakeClick={() => alert("Please go to the main Evidence Vault to log new items.")}
        />
      )}
    </div>
  );
};
