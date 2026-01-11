/**
 * Custom hook for managing related cases array
 */

import { useCallback } from 'react';

export interface RelatedCase {
  court: string;
  caseNumber: string;
  relationship?: string;
}

export interface UseRelatedCasesResult {
  addRelatedCase: () => void;
  removeRelatedCase: (index: number) => void;
  updateRelatedCase: (index: number, field: string, value: string) => void;
}

export const useRelatedCases = (
  relatedCases: RelatedCase[],
  setRelatedCases: (cases: RelatedCase[]) => void
): UseRelatedCasesResult => {
  const addRelatedCase = useCallback(() => {
    setRelatedCases([...relatedCases, { court: '', caseNumber: '', relationship: '' }]);
  }, [relatedCases, setRelatedCases]);

  const removeRelatedCase = useCallback((index: number) => {
    setRelatedCases(relatedCases.filter((_, i) => i !== index));
  }, [relatedCases, setRelatedCases]);

  const updateRelatedCase = useCallback((index: number, field: string, value: string) => {
    setRelatedCases(
      relatedCases.map((rc, i) =>
        i === index ? { ...rc, [field]: value } : rc
      )
    );
  }, [relatedCases, setRelatedCases]);

  return {
    addRelatedCase,
    removeRelatedCase,
    updateRelatedCase,
  };
};
