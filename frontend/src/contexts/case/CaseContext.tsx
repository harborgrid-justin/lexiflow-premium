import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { StorageUtils } from '@/utils/storage';

interface CaseStateValue {
  selectedCaseId: string | null;
}

interface CaseActionsValue {
  selectCase: (caseId: string | null) => void;
  clearSelection: () => void;
}

export type CaseContextValue = CaseStateValue & CaseActionsValue;

const CaseStateContext = createContext<CaseStateValue | undefined>(undefined);
const CaseActionsContext = createContext<CaseActionsValue | undefined>(undefined);

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

  const stateValue = useMemo<CaseStateValue>(() => ({
    selectedCaseId,
  }), [selectedCaseId]);

  const actionsValue = useMemo<CaseActionsValue>(() => ({
    selectCase,
    clearSelection,
  }), [selectCase, clearSelection]);

  return (
    <CaseStateContext.Provider value={stateValue}>
      <CaseActionsContext.Provider value={actionsValue}>
        {children}
      </CaseActionsContext.Provider>
    </CaseStateContext.Provider>
  );
};

export function useCaseState(): CaseStateValue {
  const context = useContext(CaseStateContext);
  if (!context) {
    throw new Error('useCaseState must be used within a CaseProvider');
  }
  return context;
}

export function useCaseActions(): CaseActionsValue {
  const context = useContext(CaseActionsContext);
  if (!context) {
    throw new Error('useCaseActions must be used within a CaseProvider');
  }
  return context;
}

export function useCaseContext(): CaseContextValue {
  return {
    ...useCaseState(),
    ...useCaseActions(),
  };
}
