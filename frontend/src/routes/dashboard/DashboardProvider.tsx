import React, { createContext, useContext, useMemo } from 'react';
import type { Case, DocketEntry, Task, TimeEntry } from '../../types';

interface DashboardMetrics {
  totalCases: number;
  activeCases: number;
  upcomingDeadlines: number;
  pendingTasks: number;
  todayDocketEntries: number;
  weekHours: number;
  casesByStatus: Record<string, number>;
  casesByType: Record<string, number>;
}

interface DashboardContextValue {
  cases: Case[];
  docketEntries: DocketEntry[];
  timeEntries: TimeEntry[];
  tasks: Task[];
  metrics: DashboardMetrics;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  children: React.ReactNode;
  initialCases: Case[];
  initialDocketEntries: DocketEntry[];
  initialTimeEntries: TimeEntry[];
  initialTasks: Task[];
}

/**
 * DashboardProvider - Domain Logic Layer
 */
export function DashboardProvider({
  children,
  initialCases,
  initialDocketEntries,
  initialTimeEntries,
  initialTasks
}: DashboardProviderProps) {
  // Compute dashboard metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    const totalCases = initialCases.length;
    const activeCases = initialCases.filter(c => c.status === 'Active').length;

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingDeadlines = initialCases.filter(c => {
      if (!c.trialDate) return false;
      const hearingDate = new Date(c.trialDate);
      return hearingDate >= today && hearingDate <= nextWeek;
    }).length;

    const pendingTasks = initialTasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length;

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayDocketEntries = initialDocketEntries.filter(
      entry => new Date(entry.entryDate) >= todayStart
    ).length;

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekHours = initialTimeEntries
      .filter(entry => new Date(entry.date) >= weekStart)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const casesByStatus = initialCases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const casesByType = initialCases.reduce((acc, c) => {
      const type = c.type || c.matterType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCases,
      activeCases,
      upcomingDeadlines,
      pendingTasks,
      todayDocketEntries,
      weekHours,
      casesByStatus,
      casesByType
    };
  }, [initialCases, initialDocketEntries, initialTimeEntries, initialTasks]);

  const value = useMemo<DashboardContextValue>(() => ({
    cases: initialCases,
    docketEntries: initialDocketEntries,
    timeEntries: initialTimeEntries,
    tasks: initialTasks,
    metrics
  }), [initialCases, initialDocketEntries, initialTimeEntries, initialTasks, metrics]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
