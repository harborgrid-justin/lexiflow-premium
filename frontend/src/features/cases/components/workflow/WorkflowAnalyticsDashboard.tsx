/**
 * @module components/workflow/WorkflowAnalyticsDashboard
 * @category Workflow
 * @description Analytics dashboard for workflow completion and SLA metrics.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { getChartTheme } from '@/utils/chartConfig';
import { queryKeys } from '@/utils/queryKeys';

// Hooks & Context
import { useTheme } from '@/features/theme';

// Components
import { Card } from '@/shared/ui/molecules/Card/Card';
import { LoadingState } from '@/shared/ui/molecules/LoadingState/LoadingState';

// Utils & Constants
import {
  DEFAULT_MARGINS,
  getAxisConfig,
  getGridConfig,
  getTooltipConfig
} from '@/utils/chartConfig';

// Types
import { WorkflowAnalyticsData } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

export function WorkflowAnalyticsDashboard() {
  const { mode } = useTheme();

  // Load analytics from IndexedDB via useQuery for accurate, cached data
  const { data: analytics = { completion: [], status: [] }, isLoading } = useQuery<WorkflowAnalyticsData>(
    queryKeys.workflowsExtended.analytics(),
    () => DataService.workflow.getAnalytics()
  );

  const chartTheme = getChartTheme(mode as 'light' | 'dark');
  const axisConfig = getAxisConfig(chartTheme);
  const gridConfig = getGridConfig(chartTheme);
  const tooltipConfig = getTooltipConfig(chartTheme);

  if (isLoading) {
    return <LoadingState message="Loading analytics..." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Task Completion Velocity">
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={analytics.completion} margin={DEFAULT_MARGINS}>
            <CartesianGrid {...gridConfig} />
            <XAxis dataKey="name" {...axisConfig} />
            <YAxis {...axisConfig} />
            <Tooltip {...tooltipConfig} />
            <Bar dataKey="completed" fill={chartTheme.colors.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="SLA Health Status">
        <ResponsiveContainer width="100%" height={256}>
          <PieChart>
            <Pie data={analytics.status} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {analytics.status.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipConfig} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

WorkflowAnalyticsDashboard.displayName = 'WorkflowAnalyticsDashboard';
