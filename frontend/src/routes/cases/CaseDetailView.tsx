import type { Case } from '@/types';
import React from 'react';
import { CaseDetailProvider } from './CaseDetailContext';
import { CaseDetailShell } from './CaseDetailShell';
import { useCaseDetail } from './hooks/useCaseDetail';

interface CaseDetailViewProps {
  caseData: Case;
  onBack: () => void;
  onSelectCase: (c: Case) => void;
  initialTab?: string;
}

/**
 * Enterprise Case Detail View
 *
 * Replaces the deprecated CaseDetailPage.
 * Bridges the gap between AppContentRenderer (prop-based) and the new Enterprise structure (Context/Hook based).
 */
export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseData,
  onBack,
  onSelectCase,
  initialTab = 'Overview'
}) => {
  // Initialize the hook with passed data
  // Note: We don't have initialDocuments/initialParties here, so React Query will fetch them.
  // This is acceptable behavior for the transition.
  const detailContext = useCaseDetail(caseData, initialTab);

  return (
    <CaseDetailProvider value={{
      ...detailContext,
      caseData
    }}>
      <CaseDetailShell />
    </CaseDetailProvider>
  );
};

// Export as default for lazy loading compatibility if needed,
// though named export is preferred in new standard.
export default CaseDetailView;
