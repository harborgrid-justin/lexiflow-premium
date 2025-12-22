import React from 'react';
import { Card } from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../hooks/useQueryHooks';
import { useChartTheme } from '../common/ChartHelpers';

export const ClientAnalytics: React.FC = () => {
  const chartTheme = useChartTheme();

  // Enterprise Data Access
  const { data: analyticsData } = useQuery(
      ['crm', 'analytics'],
      DataService.crm.getAnalytics
  );

  // Type guard for analytics
  const analyticsRevenue = typeof analyticsData === 'object' && analyticsData !== null && 'revenue' in analyticsData && Array.isArray(analyticsData.revenue)
    ? analyticsData.revenue : [];
  const analyticsSources = typeof analyticsData === 'object' && analyticsData !== null && 'sources' in analyticsData && Array.isArray(analyticsData.sources)
    ? analyticsData.sources : [];

  const analytics = {
    revenue: analyticsRevenue,
    sources: analyticsSources
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Composition (Retained vs New)">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTheme.text, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTheme.text, fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  cursor={{fill: chartTheme.grid}}
                  formatter={(value: unknown) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    return `$${numValue.toLocaleString()}`;
                  }}
                  contentStyle={chartTheme.tooltipStyle}
                />
                <Legend />
                <Bar dataKey="retained" name="Retained Revenue" stackId="a" fill={chartTheme.colors.blue} radius={[0, 0, 4, 4]} />
                <Bar dataKey="new" name="New Business" stackId="a" fill={chartTheme.colors.emerald} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Lead Source Efficiency">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sources} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fill: chartTheme.text, fontSize: 12}} />
                <Tooltip cursor={{fill: chartTheme.grid}} contentStyle={chartTheme.tooltipStyle} />
                <Bar dataKey="value" fill={chartTheme.colors.purple} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
