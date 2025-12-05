
import React from 'react';
import { Card } from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Megaphone, Target, ArrowRight } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { MarketingMetric } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';

export const MarketingDashboard: React.FC = () => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: metrics = [] } = useQuery<MarketingMetric[]>(
      ['marketing', 'metrics'],
      DataService.marketing.getMetrics
  );

  // Calculate totals
  const totalPipelineValue = metrics.reduce((acc, curr) => acc + curr.revenue, 0);
  const avgConversion = metrics.length > 0 ? (metrics.reduce((acc, curr) => acc + (curr.conversions/curr.leads), 0) / metrics.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase">Pipeline Value</p>
              <p className="text-3xl font-bold mt-1">${(totalPipelineValue / 1000).toFixed(1)}M</p>
            </div>
            <Target className="h-8 w-8 text-white opacity-20"/>
          </div>
          <p className="text-xs text-indigo-100 mt-4">Potential revenue from tracked leads.</p>
        </div>
        
        <div className={cn("rounded-lg p-6 border shadow-sm", theme.surface, theme.border.default)}>
          <div className="flex justify-between items-start">
            <div>
              <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Avg Conversion Rate</p>
              <p className={cn("text-3xl font-bold mt-1", theme.text.primary)}>{avgConversion.toFixed(1)}%</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-20"/>
          </div>
          <p className="text-xs text-green-600 mt-4 font-bold">↑ 2.1% from last month</p>
        </div>

        <div className={cn("rounded-lg p-6 border shadow-sm", theme.surface, theme.border.default)}>
          <div className="flex justify-between items-start">
            <div>
              <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Cost Per Acquisition</p>
              <p className={cn("text-3xl font-bold mt-1", theme.text.primary)}>$450</p>
            </div>
            <Megaphone className="h-8 w-8 text-amber-500 opacity-20"/>
          </div>
          <p className={cn("text-xs mt-4", theme.text.secondary)}>Based on ad spend vs retained matters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue by Lead Source">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="source" type="category" width={100} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {metrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Active Marketing Campaigns">
          <div className="space-y-4">
            <div className={cn("p-3 border rounded-lg flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
              <div>
                <h4 className={cn("font-bold text-sm", theme.text.primary)}>Q1 Webinar Series</h4>
                <p className={cn("text-xs", theme.text.secondary)}>Target: Corporate Counsel</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Active</span>
            </div>
            <div className={cn("p-3 border rounded-lg flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
              <div>
                <h4 className={cn("font-bold text-sm", theme.text.primary)}>Google Ads - "Commercial Lit"</h4>
                <p className={cn("text-xs", theme.text.secondary)}>Budget: $2,000/mo</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Active</span>
            </div>
            <div className={cn("p-3 border rounded-lg flex justify-between items-center opacity-70", theme.surfaceHighlight, theme.border.default)}>
              <div>
                <h4 className={cn("font-bold text-sm", theme.text.primary)}>LegalTech Conference Sponsor</h4>
                <p className={cn("text-xs", theme.text.secondary)}>Dates: Sep 15-18</p>
              </div>
              <span className={cn("text-xs px-2 py-1 rounded font-bold", theme.surface, theme.text.secondary)}>Upcoming</span>
            </div>
            <button className="w-full text-xs text-blue-600 font-medium hover:underline flex items-center justify-center mt-2">
              View All Campaigns <ArrowRight className="h-3 w-3 ml-1"/>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
