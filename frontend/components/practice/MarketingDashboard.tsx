/**
 * @module components/practice/MarketingDashboard
 * @category Practice Management
 * @description Marketing analytics with campaigns and conversion tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Megaphone, Target, ArrowRight } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../services/infrastructure/queryClient';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Card } from '../common/Card';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { MarketingMetric, MarketingCampaign } from '../../types';

// ============================================================================
// COMPONENT
// ============================================================================

export const MarketingDashboard: React.FC = () => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: metrics = [] } = useQuery<MarketingMetric[]>(
      ['marketing', 'metrics'],
      DataService.marketing.getMetrics
  );

  const { data: campaigns = [] } = useQuery<MarketingCampaign[]>(
      ['marketing', 'campaigns'],
      DataService.marketing.getCampaigns
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
        
        <div className={cn("rounded-lg p-6 border shadow-sm", theme.surface.default, theme.border.default)}>
          <div className="flex justify-between items-start">
            <div>
              <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Avg Conversion Rate</p>
              <p className={cn("text-3xl font-bold mt-1", theme.text.primary)}>{avgConversion.toFixed(1)}%</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-20"/>
          </div>
          <p className="text-xs text-green-600 mt-4 font-bold">↑ 2.1% from last month</p>
        </div>

        <div className={cn("rounded-lg p-6 border shadow-sm", theme.surface.default, theme.border.default)}>
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
            {campaigns.map((camp) => (
              <div key={camp.id} className={cn("p-3 border rounded-lg flex justify-between items-center transition-colors", camp.status === 'Upcoming' ? "opacity-70" : "", theme.surface.highlight, theme.border.default)}>
                <div>
                  <h4 className={cn("font-bold text-sm", theme.text.primary)}>{camp.name}</h4>
                  <p className={cn("text-xs", theme.text.secondary)}>Target: {camp.target}</p>
                </div>
                <div className="text-right">
                    <span className={cn("text-xs px-2 py-1 rounded font-bold mb-1 block", camp.status === 'Active' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>
                        {camp.status}
                    </span>
                    <span className="text-[10px] text-slate-500">{camp.budget || camp.dates}</span>
                </div>
              </div>
            ))}
            <button className="w-full text-xs text-blue-600 font-medium hover:underline flex items-center justify-center mt-2">
              View All Campaigns <ArrowRight className="h-3 w-3 ml-1"/>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

