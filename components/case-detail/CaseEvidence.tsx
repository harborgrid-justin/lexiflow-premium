
import React from 'react';
import { MOCK_EVIDENCE } from '../../data/mockEvidence';
import { EvidenceInventory } from '../evidence/EvidenceInventory';

interface CaseEvidenceProps {
  caseId: string;
}

export const CaseEvidence: React.FC<CaseEvidenceProps> = ({ caseId }) => {
  // We use the EvidenceInventory purely for display here, assuming a simplified view or reusing it.
  // We mock the filter state as we are just showing case-specific items.
  const caseEvidence = MOCK_EVIDENCE.filter(e => e.caseId === caseId);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Case Evidence</h3>
      {caseEvidence.length === 0 ? (
        <p className="text-slate-500 italic">No evidence logged for this case.</p>
      ) : (
        <EvidenceInventory 
          items={MOCK_EVIDENCE} 
          filteredItems={caseEvidence} 
          filters={{ search: '', type: '', admissibility: '', caseId: '', custodian: '', dateFrom: '', dateTo: '', location: '', tags: '', collectedBy: '', hasBlockchain: false }}
          setFilters={() => {}} // No-op for read-only view in case detail context or implement local filtering if desired
          onItemClick={(item) => alert(`Viewing details for ${item.title} (Nav to Vault for full details)`)}
          onIntakeClick={() => alert("Please go to Evidence Vault to log new items.")}
        />
      )}
    </div>
  );
};
