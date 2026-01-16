/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import React, { createContext, useContext, useMemo } from 'react';
export interface ComplianceCheck {
  id: string;
  clientName: string;
  date: string;
  result: string;
  [key: string]: unknown;
}

export interface ComplianceConflict {
  id: string;
  status: string;
  description: string;
  parties: string[];
  [key: string]: unknown;
}

export interface ComplianceDeadline {
  id: string;
  date: string;
  [key: string]: unknown;
}

interface ComplianceContextValue {
  checks: ComplianceCheck[];
  conflicts: ComplianceConflict[];
  deadlines: ComplianceDeadline[];
  metrics: {
    totalChecks: number;
    pendingConflicts: number;
    upcomingDeadlines: number;
  };
}

const ComplianceContext = createContext<ComplianceContextValue | null>(null);

export function ComplianceProvider({ children, initialChecks, initialConflicts, initialDeadlines }: {
  children: React.ReactNode;
  initialChecks: ComplianceCheck[];
  initialConflicts: ComplianceConflict[];
  initialDeadlines: ComplianceDeadline[];
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
