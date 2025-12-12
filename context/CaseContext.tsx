/**
 * Case Context
 * Manages current case state and recent cases history
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  status: 'open' | 'pending' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientName: string;
  clientId: string;
  assignedTo: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CaseTab {
  id: string;
  caseId: string;
  title: string;
  type: 'overview' | 'documents' | 'timeline' | 'notes' | 'evidence' | 'calendar' | 'custom';
  timestamp: number;
}

interface CaseContextType {
  // Current case
  currentCase: Case | null;
  setCurrentCase: (caseData: Case | null) => void;
  updateCurrentCase: (updates: Partial<Case>) => void;

  // Recent cases
  recentCases: Case[];
  addRecentCase: (caseData: Case) => void;
  removeRecentCase: (caseId: string) => void;
  clearRecentCases: () => void;

  // Open tabs
  openTabs: CaseTab[];
  addTab: (tab: Omit<CaseTab, 'id' | 'timestamp'>) => void;
  removeTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<CaseTab>) => void;
  clearTabs: () => void;
  getTabsByCase: (caseId: string) => CaseTab[];

  // Active tab
  activeTabId: string | null;
  setActiveTabId: (tabId: string | null) => void;

  // Case operations
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Case navigation
  navigateToCase: (caseData: Case, tabType?: string) => void;
  closeCase: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const MAX_RECENT_CASES = 10;
const MAX_OPEN_TABS = 20;

export const CaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current case state
  const [currentCase, setCurrentCaseState] = useState<Case | null>(null);

  // Recent cases (persisted)
  const [recentCases, setRecentCases] = useLocalStorage<Case[]>('recent-cases', []);

  // Open tabs (persisted)
  const [openTabs, setOpenTabs] = useLocalStorage<CaseTab[]>('open-case-tabs', []);

  // Active tab ID
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set current case and add to recent cases
  const setCurrentCase = useCallback((caseData: Case | null) => {
    setCurrentCaseState(caseData);
    if (caseData) {
      addRecentCase(caseData);
    }
    setError(null);
  }, []);

  // Update current case
  const updateCurrentCase = useCallback((updates: Partial<Case>) => {
    setCurrentCaseState(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };

      // Also update in recent cases
      setRecentCases(prevRecent =>
        prevRecent.map(c => c.id === updated.id ? updated : c)
      );

      return updated;
    });
  }, [setRecentCases]);

  // Add case to recent cases
  const addRecentCase = useCallback((caseData: Case) => {
    setRecentCases(prev => {
      // Remove if already exists
      const filtered = prev.filter(c => c.id !== caseData.id);
      // Add to front
      const updated = [caseData, ...filtered];
      // Keep only max recent cases
      return updated.slice(0, MAX_RECENT_CASES);
    });
  }, [setRecentCases]);

  // Remove case from recent cases
  const removeRecentCase = useCallback((caseId: string) => {
    setRecentCases(prev => prev.filter(c => c.id !== caseId));
  }, [setRecentCases]);

  // Clear all recent cases
  const clearRecentCases = useCallback(() => {
    setRecentCases([]);
  }, [setRecentCases]);

  // Add tab
  const addTab = useCallback((tab: Omit<CaseTab, 'id' | 'timestamp'>) => {
    const newTab: CaseTab = {
      ...tab,
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setOpenTabs(prev => {
      // Check if tab already exists for this case and type
      const existingTab = prev.find(t => t.caseId === tab.caseId && t.type === tab.type);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return prev;
      }

      // Add new tab
      const updated = [...prev, newTab];
      // Keep only max tabs
      const limited = updated.slice(-MAX_OPEN_TABS);

      setActiveTabId(newTab.id);
      return limited;
    });
  }, [setOpenTabs]);

  // Remove tab
  const removeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId);

      // If active tab was removed, set a new active tab
      if (activeTabId === tabId && filtered.length > 0) {
        setActiveTabId(filtered[filtered.length - 1].id);
      } else if (filtered.length === 0) {
        setActiveTabId(null);
      }

      return filtered;
    });
  }, [setOpenTabs, activeTabId]);

  // Update tab
  const updateTab = useCallback((tabId: string, updates: Partial<CaseTab>) => {
    setOpenTabs(prev =>
      prev.map(tab => tab.id === tabId ? { ...tab, ...updates } : tab)
    );
  }, [setOpenTabs]);

  // Clear all tabs
  const clearTabs = useCallback(() => {
    setOpenTabs([]);
    setActiveTabId(null);
  }, [setOpenTabs]);

  // Get tabs by case ID
  const getTabsByCase = useCallback((caseId: string): CaseTab[] => {
    return openTabs.filter(tab => tab.caseId === caseId);
  }, [openTabs]);

  // Navigate to case
  const navigateToCase = useCallback((caseData: Case, tabType: string = 'overview') => {
    setCurrentCase(caseData);
    addTab({
      caseId: caseData.id,
      title: `${caseData.caseNumber} - ${tabType}`,
      type: tabType as any,
    });
  }, [setCurrentCase, addTab]);

  // Close case
  const closeCase = useCallback(() => {
    setCurrentCaseState(null);
    setActiveTabId(null);
    setError(null);
  }, []);

  // Cleanup old tabs periodically (older than 7 days)
  useEffect(() => {
    const cleanup = () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      setOpenTabs(prev => prev.filter(tab => tab.timestamp > sevenDaysAgo));
    };

    const interval = setInterval(cleanup, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [setOpenTabs]);

  // Memoize context value
  const value = useMemo<CaseContextType>(() => ({
    currentCase,
    setCurrentCase,
    updateCurrentCase,
    recentCases,
    addRecentCase,
    removeRecentCase,
    clearRecentCases,
    openTabs,
    addTab,
    removeTab,
    updateTab,
    clearTabs,
    getTabsByCase,
    activeTabId,
    setActiveTabId,
    isLoading,
    setIsLoading,
    error,
    setError,
    navigateToCase,
    closeCase,
  }), [
    currentCase,
    setCurrentCase,
    updateCurrentCase,
    recentCases,
    addRecentCase,
    removeRecentCase,
    clearRecentCases,
    openTabs,
    addTab,
    removeTab,
    updateTab,
    clearTabs,
    getTabsByCase,
    activeTabId,
    setActiveTabId,
    isLoading,
    setIsLoading,
    error,
    setError,
    navigateToCase,
    closeCase,
  ]);

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};

export const useCaseContext = (): CaseContextType => {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};

export default CaseContext;
