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
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/dataService';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Card } from '../common/Card';

// Utils & Constants
import { getChartColors } from './constants';

// Types
import { WorkflowAnalyticsData } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

export const WorkflowAnalyticsDashboard: React.FC = () => {
  const { theme, mode } = useTheme();
  const [analytics, setAnalytics] = useState<WorkflowAnalyticsData>({ completion: [], status: [] });

  useEffect(() => {
      const load = async () => {
          const data = await DataService.workflow.getAnalytics();
          setAnalytics(data);
      };
      load();
  }, []);
  
  const chartColors = getChartColors(mode);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Task Completion Velocity">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.completion} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: chartColors.text}} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: chartColors.text}} />
              <Tooltip 
                cursor={{fill: mode === 'dark' ? '#334155' : '#f1f5f9'}} 
                contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="SLA Health Status">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.status} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {analytics.status.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
