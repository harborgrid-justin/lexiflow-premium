/**
 * CaseEvidence.tsx
 * 
 * Case-scoped evidence management wrapper that delegates to EvidenceInventory
 * component with filtering and intake capabilities.
 * 
 * @module components/case-detail/CaseEvidence
 * @category Case Management - Evidence Management
 */

// External Dependencies
import React from 'react';
import { Loader2, FolderOpen } from 'lucide-react';

// Internal Dependencies - Components
import { EvidenceInventory } from '@features/litigation';
import { EmptyState } from '@/components/molecules/EmptyState';

// Internal Dependencies - Hooks & Context
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
    handleIntakeComplete: _handleIntakeComplete 
  } = useEvidenceVault(caseId);

  // isLoading can be derived from the hook's underlying useQuery if needed,
  // but for simplicity we can check the items array.
  if (!evidenceItems) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-6 w-6"/></div>;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {evidenceItems.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No evidence logged"
          description="No evidence items have been logged for this case yet."
        />
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
