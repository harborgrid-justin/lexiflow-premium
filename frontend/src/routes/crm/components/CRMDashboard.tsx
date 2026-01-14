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
import { Activity, ArrowUpRight, Briefcase, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/backend';
import { DataService } from '@/services/data/dataService';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { ClientStatus } from '@/types/financial';

// Hooks & Context
import { useTheme } from '@/theme';

// Components
import { Card } from '@/shared/ui/molecules/Card/Card';
import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';

// Utils & Constants
import { ChartColorService } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { getChartTheme } from '@/utils/chartConfig';

// Types
import type { CRMAnalytics, CRMLead } from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================
export function CRMDashboard() {
  const { theme, mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as 'light' | 'dark');
  const chartTheme = getChartTheme(mode as 'light' | 'dark');

  // Enterprise Data Access
  const { data: analyticsData } = useQuery<CRMAnalytics>(
    ['crm', 'analytics'],
    () => DataService.crm.getAnalytics(mode)
  );

  const analytics: CRMAnalytics = analyticsData || {
    growth: [],
    industry: [],
    revenue: [],
    sources: []
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clientsResponse } = useQuery<any>(QUERY_KEYS.CLIENTS.ALL, () => DataService.clients.getAll());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: casesResponse } = useQuery<any>(QUERY_KEYS.CASES.ALL, () => DataService.cases.getAll());
  const { data: leads = [] } = useQuery<CRMLead[]>(QUERY_KEYS.CRM.LEADS, () => DataService.crm.getLeads());

  // Handle paginated response format from backend
  const clients = Array.isArray(clientsResponse)
    ? clientsResponse
    : (clientsResponse?.data || []);
  const cases = Array.isArray(casesResponse)
    ? casesResponse
    : (casesResponse?.data || []);

  // Calculate dynamic metrics
  const activeClients = (Array.isArray(clients) ? clients : []).filter((c) =>
    c.status === ClientStatus.ACTIVE
  ).length;

  const lifetimeRevenue = (Array.isArray(clients) ? clients : []).reduce((acc, c) => acc + (c.totalBilled || 0), 0);

  const activeMatters = (Array.isArray(cases) ? cases : []).filter((c) =>
    c.status !== 'Closed' && c.status !== 'Settled' && c.status !== 'Archived'
  ).length;

  const pipelineValue = leads.reduce((acc, l) => {
    const valueStr = l.value || '0';
    const value = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
    return acc + (isNaN(value) ? 0 : value);
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
          <div className="h-72 w-full" style={{ minHeight: '288px', height: '288px' }}>
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart data={analytics.growth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                <Tooltip
                  cursor={{ stroke: chartColors[0], strokeWidth: 1 }}
                  contentStyle={chartTheme.tooltipStyle}
                />
                <Area type="monotone" dataKey="clients" stroke={chartColors[0]} fillOpacity={1} fill="url(#colorClients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Industry Breakdown */}
        <Card title="Portfolio by Industry">
          <div className="h-72 w-full" style={{ minHeight: '288px', height: '288px' }}>
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={analytics.industry} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {analytics.industry.map((_, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
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
            {cases.slice(0, 3).map((caseItem: { id: string; caseNumber?: string; title: string; status?: string }, idx: number) => (
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
                  {caseItem.updatedAt ? new Date(caseItem.updatedAt).toLocaleDateString() : 'N/A'}
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
              .sort((a: { totalBilled?: number }, b: { totalBilled?: number }) => (b.totalBilled || 0) - (a.totalBilled || 0))
              .slice(0, 3)
              .map((client: { id: string; name: string; totalBilled?: number }, idx: number) => (
                <div key={idx} className={cn("flex justify-between items-center p-3 rounded-lg border hover:shadow-sm transition-all", theme.surface.default, theme.border.default)}>
                  <div>
                    <p className={cn("font-bold text-sm", theme.text.primary)}>{client.name || 'Unknown'}</p>
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
}
