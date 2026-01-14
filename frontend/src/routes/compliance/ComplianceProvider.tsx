import React, { createContext, useContext, useMemo } from 'react';

interface ComplianceContextValue {
  checks: any[];
  conflicts: any[];
  deadlines: any[];
  metrics: {
    totalChecks: number;
    pendingConflicts: number;
    upcomingDeadlines: number;
  };
}

const ComplianceContext = createContext<ComplianceContextValue | null>(null);

export function ComplianceProvider({ children, initialChecks, initialConflicts, initialDeadlines }: {
  children: React.ReactNode;
  initialChecks: any[];
  initialConflicts: any[];
  initialDeadlines: any[];
}) {
  const metrics = useMemo(() => ({
    totalChecks: initialChecks.length,
    pendingConflicts: initialConflicts.filter(c => c.status === 'pending').length,
    upcomingDeadlines: initialDeadlines.filter(d => new Date(d.date) > new Date()).length
  }), [initialChecks, initialConflicts, initialDeadlines]);

  const value = useMemo<ComplianceContextValue>(() => ({
    checks: initialChecks,
    conflicts: initialConflicts,
    deadlines: initialDeadlines,
    metrics
  }), [initialChecks, initialConflicts, initialDeadlines, metrics]);

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
}

export function useCompliance() {
  const context = useContext(ComplianceContext);
  if (!context) throw new Error('useCompliance must be used within ComplianceProvider');
  return context;
}
