/**
 * @module components/crm/CRMDashboard
 * @category CRM
 * @description Client relationship management with contacts, clients, and leads.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Users, DollarSign, Briefcase, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { MetricCard } from '../common/Primitives';
import { Card } from '../common/Card';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================
export const CRMDashboard: React.FC = () => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: analytics = { growth: [], industry: [], revenue: [], sources: [] } } = useQuery(
      ['crm', 'analytics'],
      DataService.crm.getAnalytics
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Active Clients" 
          value="59" 
          icon={Users} 
          trend="+12% YTD" 
          trendUp={true}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard 
          label="Lifetime Revenue" 
          value="$4.2M" 
          icon={DollarSign} 
          trend="+8% vs Last Year" 
          trendUp={true}
          className="border-l-4 border-l-emerald-600"
        />
        <MetricCard 
          label="Active Matters" 
          value="142" 
          icon={Briefcase} 
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard 
          label="Pipeline Value" 
          value="$850k" 
          icon={TrendingUp} 
          trend="15 Deals"
          className="border-l-4 border-l-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card title="Client Acquisition Growth" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.growth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="clients" stroke="#3b82f6" fillOpacity={1} fill="url(#colorClients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Industry Breakdown */}
        <Card title="Portfolio by Industry">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.industry} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {analytics.industry.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Interactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Client Interactions">
          <div className="space-y-4">
            {[
              { client: 'TechCorp', action: 'Matter Opened', date: '2 hours ago', user: 'Alexandra H.' },
              { client: 'OmniGlobal', action: 'Invoice Paid', date: '5 hours ago', user: 'Finance' },
              { client: 'GreenEnergy', action: 'Document Uploaded', date: 'Yesterday', user: 'James Doe' },
            ].map((item, idx) => (
              <div key={idx} className={cn("flex justify-between items-center p-3 border-b last:border-0", theme.border.default)}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full", theme.surface.highlight)}>
                    <Activity className={cn("h-4 w-4", theme.text.secondary)} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", theme.text.primary)}>{item.client}</p>
                    <p className={cn("text-xs", theme.text.secondary)}>{item.action} • {item.user}</p>
                  </div>
                </div>
                <span className={cn("text-xs font-mono", theme.text.tertiary)}>{item.date}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Key Accounts (Top Revenue)">
          <div className="space-y-4">
            {[
              { name: 'TechCorp Industries', revenue: '$1.2M', status: 'Active' },
              { name: 'OmniGlobal Inc.', revenue: '$850k', status: 'Active' },
              { name: 'StartUp Ventures', revenue: '$420k', status: 'Pending Renewal' },
            ].map((acc, idx) => (
              <div key={idx} className={cn("flex justify-between items-center p-3 rounded-lg border hover:shadow-sm transition-all", theme.surface.default, theme.border.default)}>
                <div>
                  <p className={cn("font-bold text-sm", theme.text.primary)}>{acc.name}</p>
                  <p className={cn("text-xs", theme.text.secondary)}>{acc.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono font-bold text-sm", theme.text.primary)}>{acc.revenue}</span>
                  <ArrowUpRight className={cn("h-4 w-4", theme.text.tertiary)} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
