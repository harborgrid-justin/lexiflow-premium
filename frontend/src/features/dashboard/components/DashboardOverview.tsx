/**
 * @module components/dashboard/DashboardOverview
 * @category Dashboard
 * @description Main overview dashboard combining metrics, analytics, and sidebar.
 *
 * THEME SYSTEM USAGE:
 * This component delegates to child components that use the theme system.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo, useDeferredValue } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import {
  useDashboardAlerts,
  useDashboardCharts,
  useDashboardStats,
  useDashboardTasks
} from '../hooks/useDashboardData';

// Components
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { DashboardAnalytics } from './DashboardAnalytics';
import { DashboardMetrics } from './DashboardMetrics';
import { DashboardSidebar } from './DashboardSidebar';

// Types
import type { CaseId, TaskId, WorkflowTask } from '@/types';
import { TaskStatusBackend } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ActiveProject {
  id: TaskId;
  title: string;
  case: string | CaseId;
  progress: number;
  status: TaskStatusBackend;
  due: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DashboardOverview: React.FC = () => {
  // Enterprise Data Access: Parallel Queries with Caching
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { tasks } = useDashboardTasks();
  const { chartData: rawChartData } = useDashboardCharts();
  const { alerts } = useDashboardAlerts();

  // Transform chart data from { name, value } to { name, count } for DashboardAnalytics
  const chartData = rawChartData.map(item => ({ name: item.name, count: item.value }));

  // Optimization: Use useDeferredValue to prioritize UI responsiveness over derived data calculation
  // (Rule 21 & 33: Interruptible renders and transitional states)
  const deferredTasks = useDeferredValue(tasks);
  
  const activeProjects = useMemo(() => {
    if (!deferredTasks || deferredTasks.length === 0) return [];
    
    return deferredTasks
      .filter((t: WorkflowTask) => t.priority === 'High' && t.status !== TaskStatusBackend.COMPLETED)
      .slice(0, 5)
      .map((t: WorkflowTask) => ({
        id: t.id,
        title: t.title,
        case: t.caseId || 'General',
        progress: t.status === 'In Progress' ? 50 : 10,
        status: t.status,
        due: t.dueDate || 'No due date'
      }));
  }, [deferredTasks]);

  if (statsLoading) return <LazyLoader message="Aggregating Firm Intelligence..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardMetrics stats={stats || null} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DashboardAnalytics activeProjects={activeProjects} chartData={chartData} />
        <DashboardSidebar alerts={alerts} />
      </div>
    </div>
  );
};
