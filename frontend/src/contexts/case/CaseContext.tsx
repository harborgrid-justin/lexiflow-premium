/**
 * @module contexts/case/CaseContext
 * @description Case context for managing case-specific data and operations
 */

import type { Case } from '@/types';
import { createContext, useContext } from 'react';

export interface CaseContextValue {
  currentCase?: Case;
  setCurrentCase: (caseData: Case | undefined) => void;
  isLoading: boolean;
}

export const CaseContext = createContext<CaseContextValue | null>(null);

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within CaseProvider');
  }
  return context;
}
