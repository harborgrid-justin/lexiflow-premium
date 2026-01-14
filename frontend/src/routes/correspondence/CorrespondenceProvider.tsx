import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

interface CorrespondenceContextValue {
  emails: any[];
  letters: any[];
  templates: any[];
  metrics: {
    totalEmails: number;
    unreadEmails: number;
    totalLetters: number;
    totalTemplates: number;
  };
  activeTab: 'emails' | 'letters' | 'templates';
  setActiveTab: (tab: 'emails' | 'letters' | 'templates') => void;
  isPending: boolean;
}

const CorrespondenceContext = createContext<CorrespondenceContextValue | null>(null);

export function CorrespondenceProvider({ children, initialEmails, initialLetters, initialTemplates }: {
  children: React.ReactNode;
  initialEmails: any[];
  initialLetters: any[];
  initialTemplates: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useState<'emails' | 'letters' | 'templates'>('emails');

  const metrics = useMemo(() => ({
    totalEmails: initialEmails.length,
    unreadEmails: initialEmails.filter(e => !e.read).length,
    totalLetters: initialLetters.length,
    totalTemplates: initialTemplates.length
  }), [initialEmails, initialLetters, initialTemplates]);

  const setActiveTab = useCallback((tab: typeof activeTab) => {
    startTransition(() => setActiveTabState(tab));
  }, []);

  const value = useMemo<CorrespondenceContextValue>(() => ({
    emails: initialEmails,
    letters: initialLetters,
    templates: initialTemplates,
    metrics,
    activeTab,
    setActiveTab,
    isPending
  }), [initialEmails, initialLetters, initialTemplates, metrics, activeTab, setActiveTab, isPending]);

  return <CorrespondenceContext.Provider value={value}>{children}</CorrespondenceContext.Provider>;
}

export function useCorrespondence() {
  const context = useContext(CorrespondenceContext);
  if (!context) throw new Error('useCorrespondence must be used within CorrespondenceProvider');
  return context;
}
