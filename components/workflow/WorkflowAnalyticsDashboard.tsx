
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { DataService } from '../../services/dataService';

interface WorkflowAnalyticsData {
    completion: { name: string; completed: number }[];
    status: { name: string; value: number; color: string }[];
}

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
  
  const chartColors = {
    grid: mode === 'dark' ? '#334155' : '#e2e8f0',
    text: mode === 'dark' ? '#94a3b8' : '#64748b',
    tooltipBg: mode === 'dark' ? '#1e293b' : '#ffffff',
    tooltipBorder: mode === 'dark' ? '#334155' : '#e2e8f0'
  };

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
