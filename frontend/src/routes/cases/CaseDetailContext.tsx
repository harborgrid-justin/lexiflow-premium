import React, { createContext, useContext } from 'react';

import { type UseCaseDetailReturn } from './hooks/useCaseDetail';

import type { Case } from '@/types';

interface CaseDetailContextValue extends UseCaseDetailReturn {
  caseData: Case;
}

const CaseDetailContext = createContext<CaseDetailContextValue | null>(null);

export function CaseDetailProvider({ children, value }: { children: React.ReactNode; value: CaseDetailContextValue }) {
  return (
    <CaseDetailContext.Provider value={value}>
      {children}
    </CaseDetailContext.Provider>
  );
}

export function useCaseDetailContext() {
  const context = useContext(CaseDetailContext);
  if (!context) {
    throw new Error('useCaseDetailContext must be used within a CaseDetailProvider');
  }
  return context;
}
