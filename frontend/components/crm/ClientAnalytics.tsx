import React from 'react';
import { Card } from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { DataService } from '../../services/data/dataService'';
import { useQuery } from '../../services/queryClient';
import { useChartTheme } from '../common/ChartHelpers';

export const ClientAnalytics: React.FC = () => {
  const chartTheme = useChartTheme();

  // Enterprise Data Access
  const { data: analytics = { revenue: [], sources: [] } } = useQuery(
      ['crm', 'analytics'],
      DataService.crm.getAnalytics
  );

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
                <Tooltip cursor={{fill: chartTheme.grid}} formatter={(value: any) => `$${value.toLocaleString()}`} contentStyle={chartTheme.tooltipStyle} />
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
