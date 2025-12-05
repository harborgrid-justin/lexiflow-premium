
import React from 'react';
import { Card } from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';

export const ClientAnalytics: React.FC = () => {
  const { theme } = useTheme();

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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="retained" name="Retained Revenue" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="new" name="New Business" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Lead Source Efficiency">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sources} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
