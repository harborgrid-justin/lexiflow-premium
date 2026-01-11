import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StorageUtils } from '@/utils/storage';

interface CaseContextType {
  selectedCaseId: string | null;
  selectCase: (caseId: string | null) => void;
  clearSelection: () => void;
}

const CaseContext = createContext<CaseContextType | null>(null);

const STORAGE_KEY = 'lexiflow_global_context_case_id';

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(() => {
    // Initialize from storage if available
    return StorageUtils.get<string | null>(STORAGE_KEY, null);
  });

  const selectCase = useCallback((caseId: string | null) => {
    setSelectedCaseId(caseId);
    if (caseId) {
      StorageUtils.set(STORAGE_KEY, caseId);
    } else {
      StorageUtils.remove(STORAGE_KEY);
    }
  }, []);

  const clearSelection = useCallback(() => {
    selectCase(null);
  }, [selectCase]);

  // Context value memoization to prevent unnecessary re-renders
  const value = useMemo(() => ({
    selectedCaseId,
    selectCase,
    clearSelection
  }), [selectedCaseId, selectCase, clearSelection]);

  return (
    <CaseContext.Provider value={value}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};
