
import React, { useState, useEffect } from 'react';
import { DashboardMetrics } from './DashboardMetrics';
import { DashboardAnalytics } from './DashboardAnalytics';
import { DashboardSidebar } from './DashboardSidebar';
import { DataService } from '../../services/dataService';
import { LazyLoader } from '../common/LazyLoader';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { WorkflowTask } from '../../types';
import { Scheduler } from '../../utils/scheduler';

interface DashboardOverviewProps {
  onSelectCase: (caseId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onSelectCase }) => {
  // Enterprise Data Access: Parallel Queries with Caching
  const { data: stats, isLoading: statsLoading } = useQuery(['dashboard', 'stats'], DataService.dashboard.getStats);
  const { data: tasks = [] } = useQuery<WorkflowTask[]>([STORES.TASKS, 'all'], DataService.tasks.getAll);
  const { data: chartData = [] } = useQuery(['dashboard', 'charts'], DataService.dashboard.getChartData);
  const { data: alerts = [] } = useQuery(['dashboard', 'alerts'], DataService.dashboard.getRecentAlerts);

  // Optimization: Defer heavy processing of tasks to idle time
  const [activeProjects, setActiveProjects] = useState<any[]>([]);

  useEffect(() => {
      if (tasks.length > 0) {
          // Process heavy filtering/mapping in idle time to unblock initial paint
          Scheduler.defer(() => {
              const processed = tasks
                  .filter((t) => t.priority === 'High' && t.status !== 'Done')
                  .slice(0, 5)
                  .map((t) => ({
                      id: t.id,
                      title: t.title,
                      case: t.caseId || 'General',
                      progress: t.status === 'In Progress' ? 50 : 10,
                      status: t.status,
                      due: t.dueDate
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
