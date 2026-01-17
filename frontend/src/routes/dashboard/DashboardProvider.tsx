import React, { useCallback, useMemo, useState } from 'react';

import { useAuth } from "@/hooks/useAuth";

import { DashboardContext, type DashboardContextValue, type DashboardMetrics } from './DashboardContext';

import type { Case, DocketEntry, Task, TimeEntry, User } from '@/types';

interface DashboardProviderProps {
  children: React.ReactNode;
  initialCases?: Case[];
  initialDocketEntries?: DocketEntry[];
  initialTimeEntries?: TimeEntry[];
  initialTasks?: Task[];
  onRevalidate?: () => void;
}

/**
 * DashboardProvider - Domain Logic Layer
 */
export function DashboardProvider({
  children,
  initialCases = [],
  initialDocketEntries = [],
  initialTimeEntries = [],
  initialTasks = [],
  onRevalidate,
}: DashboardProviderProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth(); // Assuming useAuth returns { user }

  // Compute dashboard metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    const cases = initialCases || [];
    const docket = initialDocketEntries || [];
    const time = initialTimeEntries || [];
    const taskList = initialTasks || [];

    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'Active').length;

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingDeadlines = cases.filter(c => {
      if (!c.trialDate) return false;
      const hearingDate = new Date(c.trialDate);
      return hearingDate >= today && hearingDate <= nextWeek;
    }).length;

    const pendingTasks = taskList.filter(t => t.status === 'To Do' || t.status === 'In Progress').length;

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayDocketEntries = docket.filter(
      entry => new Date(entry.entryDate) >= todayStart
    ).length;

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekHours = time
      .filter(entry => new Date(entry.date) >= weekStart)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const casesByStatus = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const casesByType = cases.reduce((acc, c) => {
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

  const refreshData = useCallback(() => {
    onRevalidate?.();
  }, [onRevalidate]);

  const value = useMemo<DashboardContextValue>(() => ({
    cases: initialCases || [],
    docketEntries: initialDocketEntries || [],
    timeEntries: initialTimeEntries || [],
    tasks: initialTasks || [],
    metrics,
    activeTab,
    setActiveTab,
    currentUser: user as User | null,
    refreshData,
  }), [initialCases, initialDocketEntries, initialTimeEntries, initialTasks, metrics, activeTab, user, refreshData]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
