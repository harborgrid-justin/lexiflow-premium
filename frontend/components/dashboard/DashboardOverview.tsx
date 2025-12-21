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
import React, { useState, useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../hooks/useQueryHooks';
import { STORES } from '../../services/data/db';

// Components
import { DashboardMetrics } from './DashboardMetrics';
import { DashboardAnalytics } from './DashboardAnalytics';
import { DashboardSidebar } from './DashboardSidebar';
import { LazyLoader } from '../common/LazyLoader';

// Utils & Constants
import { Scheduler } from '../../utils/scheduler';

// Types
import type { WorkflowTask, ChartDataPoint, TaskId, CaseId } from '../../types';
import { TaskStatusBackend } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DashboardOverviewProps {
  /** Callback when a case is selected. */
  onSelectCase: (caseId: string) => void;
}

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

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onSelectCase }) => {
  // Enterprise Data Access: Parallel Queries with Caching
  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeCases: number;
    pendingMotions: number;
    billableHours: number;
    highRisks: number;
  } | null>(['dashboard', 'stats'], () => DataService.dashboard.getStats());
  const { data: tasks = [] } = useQuery<WorkflowTask[]>([STORES.TASKS, 'all'], () => DataService.tasks.getAll());
  const { data: chartData = [] } = useQuery<ChartDataPoint[]>(['dashboard', 'charts'], () => DataService.dashboard.getChartData());
  const { data: rawAlerts = [] } = useQuery<any[]>(['dashboard', 'alerts'], () => DataService.dashboard.getRecentAlerts());

  // Transform alerts to match DashboardAlert type
  const alerts = rawAlerts.map((alert: any, index: number) => ({
    id: typeof alert.id === 'number' ? alert.id : (parseInt(String(alert.id), 10) || index),
    message: alert.message,
    detail: alert.detail,
    time: alert.time,
    caseId: alert.caseId
  }));

  // Optimization: Defer heavy processing of tasks to idle time
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);

  useEffect(() => {
      if (tasks.length > 0) {
          // Process heavy filtering/mapping in idle time to unblock initial paint
          Scheduler.defer(() => {
              const processed = tasks
                  .filter((t) => t.priority === 'High' && t.status !== TaskStatusBackend.COMPLETED)
                  .slice(0, 5)
                  .map((t) => ({
                      id: t.id,
                      title: t.title,
                      case: t.caseId || 'General',
                      progress: t.status === 'In Progress' ? 50 : 10,
                      status: t.status,
                      due: t.dueDate || 'No due date'
                  }));
              setActiveProjects(processed);
          });
      }
  }, [tasks]);

  if (statsLoading) return <LazyLoader message="Aggregating Firm Intelligence..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardMetrics stats={stats || null} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DashboardAnalytics activeProjects={activeProjects} chartData={chartData} />
        <DashboardSidebar onSelectCase={onSelectCase} alerts={alerts} />
      </div>
    </div>
  );
};

