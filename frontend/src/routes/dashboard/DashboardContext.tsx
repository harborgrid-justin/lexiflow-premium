import { createContext, useContext } from 'react';
import type { Case, DocketEntry, Task, TimeEntry, User } from '@/types';

export interface DashboardMetrics {
  totalCases: number;
  activeCases: number;
  upcomingDeadlines: number;
  pendingTasks: number;
  todayDocketEntries: number;
  weekHours: number;
  casesByStatus: Record<string, number>;
  casesByType: Record<string, number>;
}

export interface DashboardContextValue {
  cases: Case[];
  docketEntries: DocketEntry[];
  timeEntries: TimeEntry[];
  tasks: Task[];
  metrics: DashboardMetrics;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  refreshData: () => void;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);
