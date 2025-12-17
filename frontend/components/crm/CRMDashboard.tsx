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

  const { data: clients = [] } = useQuery(['clients', 'all'], () => DataService.clients.getAll());
  const { data: cases = [] } = useQuery(['cases', 'all'], () => DataService.cases.getAll());
  const { data: leads = [] } = useQuery(['crm', 'leads'], () => DataService.crm.getLeads());

  // Calculate dynamic metrics
  const activeClients = clients.filter((c: any) => c.status === 'Active').length;
  const lifetimeRevenue = clients.reduce((acc: number, c: any) => acc + (c.totalBilled || 0), 0);
  const activeMatters = cases.filter((c: any) => c.status !== 'Closed').length;
  const pipelineValue = leads.reduce((acc: number, l: any) => {
    const value = parseFloat(l.value?.replace(/[^0-9.]/g, '') || '0');
    return acc + value;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Active Clients" 
          value={activeClients.toString()} 
          icon={Users} 
          trend="+12% YTD" 
          trendUp={true}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard 
          label="Lifetime Revenue" 
          value={`$${(lifetimeRevenue / 1000000).toFixed(1)}M`} 
          icon={DollarSign} 
          trend="+8% vs Last Year" 
          trendUp={true}
          className="border-l-4 border-l-emerald-600"
        />
        <MetricCard 
          label="Active Matters" 
          value={activeMatters.toString()} 
          icon={Briefcase} 
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard 
          label="Pipeline Value" 
          value={`$${(pipelineValue / 1000).toFixed(0)}k`} 
          icon={TrendingUp} 
          trend={`${leads.length} Deals`}
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
            {cases.slice(0, 3).map((caseItem: any, idx: number) => (
              <div key={idx} className={cn("flex justify-between items-center p-3 border-b last:border-0", theme.border.default)}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full", theme.surface.highlight)}>
                    <Activity className={cn("h-4 w-4", theme.text.secondary)} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", theme.text.primary)}>{caseItem.client || 'Unknown Client'}</p>
                    <p className={cn("text-xs", theme.text.secondary)}>{caseItem.status} • {caseItem.title}</p>
                  </div>
                </div>
                <span className={cn("text-xs font-mono", theme.text.tertiary)}>
                  {new Date(caseItem.updatedAt || caseItem.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {cases.length === 0 && (
              <p className={cn("text-sm text-center py-8", theme.text.secondary)}>No recent interactions</p>
            )}
          </div>
        </Card>

        <Card title="Key Accounts (Top Revenue)">
          <div className="space-y-4">
            {clients
              .sort((a: any, b: any) => (b.totalBilled || 0) - (a.totalBilled || 0))
              .slice(0, 3)
              .map((client: any, idx: number) => (
              <div key={idx} className={cn("flex justify-between items-center p-3 rounded-lg border hover:shadow-sm transition-all", theme.surface.default, theme.border.default)}>
                <div>
                  <p className={cn("font-bold text-sm", theme.text.primary)}>{client.name}</p>
                  <p className={cn("text-xs", theme.text.secondary)}>{client.status || 'Active'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono font-bold text-sm", theme.text.primary)}>
                    ${((client.totalBilled || 0) / 1000).toFixed(0)}k
                  </span>
                  <ArrowUpRight className={cn("h-4 w-4", theme.text.tertiary)} />
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <p className={cn("text-sm text-center py-8", theme.text.secondary)}>No clients yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
