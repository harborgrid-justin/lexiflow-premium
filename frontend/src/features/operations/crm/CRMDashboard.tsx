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
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { MetricCard } from '@/components/molecules/MetricCard';
import { Card } from '@/components/molecules/Card';

// Utils & Constants
import { cn } from '@/utils/cn';
import { ChartColorService } from '@/services/theme/chartColorService';
import { getChartTheme } from '@/utils/chartConfig';

// ============================================================================
// COMPONENT
// ============================================================================
export function CRMDashboard() {
  const { theme, mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode);
  const chartTheme = getChartTheme(mode);

  // Enterprise Data Access
  const { data: analyticsData } = useQuery(
      ['crm', 'analytics'],
      () => DataService.crm.getAnalytics(mode)
  );

  // Type guard for analytics with proper array checks
  const analyticsGrowth = typeof analyticsData === 'object' && analyticsData !== null && 'growth' in analyticsData && Array.isArray(analyticsData.growth)
    ? analyticsData.growth : [];
  const analyticsIndustry = typeof analyticsData === 'object' && analyticsData !== null && 'industry' in analyticsData && Array.isArray(analyticsData.industry)
    ? analyticsData.industry : [];
  const analyticsRevenue = typeof analyticsData === 'object' && analyticsData !== null && 'revenue' in analyticsData && Array.isArray(analyticsData.revenue)
    ? analyticsData.revenue : [];
  const analyticsSources = typeof analyticsData === 'object' && analyticsData !== null && 'sources' in analyticsData && Array.isArray(analyticsData.sources)
    ? analyticsData.sources : [];

  const analytics = {
    growth: analyticsGrowth,
    industry: analyticsIndustry,
    revenue: analyticsRevenue,
    sources: analyticsSources
  };

  const { data: clients = [] } = useQuery(['clients', 'all'], () => DataService.clients.getAll());
  const { data: cases = [] } = useQuery(['cases', 'all'], () => DataService.cases.getAll());
  const { data: leads = [] } = useQuery(['crm', 'leads'], () => DataService.crm.getLeads());

  // Ensure data is array before using array methods
  const clientsArray = Array.isArray(clients) ? clients : [];
  const casesArray = Array.isArray(cases) ? cases : [];
  const leadsArray = Array.isArray(leads) ? leads : [];

  // Calculate dynamic metrics
  const activeClients = clientsArray.filter((c: unknown) => {
    const status = typeof c === 'object' && c !== null && 'status' in c ? String(c.status) : '';
    return status === 'Active' || status === 'active';
  }).length;

  const lifetimeRevenue = clientsArray.reduce((acc: number, c: unknown) => {
    if (typeof c === 'object' && c !== null && 'totalBilled' in c) {
      const totalBilled = typeof c.totalBilled === 'number' ? c.totalBilled : 0;
      return acc + totalBilled;
    }
    return acc;
  }, 0);

  const activeMatters = casesArray.filter((c: unknown) => {
    const status = typeof c === 'object' && c !== null && 'status' in c ? String(c.status) : '';
    return status !== 'Closed' && status !== 'closed';
  }).length;

  const pipelineValue = leadsArray.reduce((acc: number, l: unknown) => {
    if (typeof l === 'object' && l !== null && 'value' in l) {
      const valueStr = typeof l.value === 'string' ? l.value : '';
      const value = parseFloat(valueStr.replace(/[^0-9.]/g, '') || '0');
      return acc + value;
    }
    return acc;
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
          trend={`${leadsArray.length} Deals`}
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
                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: chartTheme.text, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTheme.text, fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                <Tooltip 
                  cursor={{stroke: chartColors[0], strokeWidth: 1}}
                  contentStyle={chartTheme.tooltipStyle}
                />
                <Area type="monotone" dataKey="clients" stroke={chartColors[0]} fillOpacity={1} fill="url(#colorClients)" />
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
                  {analytics.industry.map((entry: unknown, index: number) => {
                    const color = typeof entry === 'object' && entry !== null && 'color' in entry && typeof entry.color === 'string'
                      ? entry.color : '#3b82f6';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
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
            {casesArray.slice(0, 3).map((caseItem: unknown, idx: number) => {
              if (typeof caseItem !== 'object' || caseItem === null) return null;
              const client = 'client' in caseItem && typeof caseItem.client === 'string' ? caseItem.client : 'Unknown Client';
              const status = 'status' in caseItem && typeof caseItem.status === 'string' ? caseItem.status : '';
              const title = 'title' in caseItem && typeof caseItem.title === 'string' ? caseItem.title : '';
              const updatedAt = 'updatedAt' in caseItem ? caseItem.updatedAt : null;
              const createdAt = 'createdAt' in caseItem ? caseItem.createdAt : null;
              const dateToShow = updatedAt || createdAt;

              return (
              <div key={idx} className={cn("flex justify-between items-center p-3 border-b last:border-0", theme.border.default)}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full", theme.surface.highlight)}>
                    <Activity className={cn("h-4 w-4", theme.text.secondary)} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", theme.text.primary)}>{client}</p>
                    <p className={cn("text-xs", theme.text.secondary)}>{status} • {title}</p>
                  </div>
                </div>
                <span className={cn("text-xs font-mono", theme.text.tertiary)}>
                  {dateToShow && (typeof dateToShow === 'string' || typeof dateToShow === 'number' || dateToShow instanceof Date) ? new Date(dateToShow as string | number | Date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              );
            })}
            {casesArray.length === 0 && (
              <p className={cn("text-sm text-center py-8", theme.text.secondary)}>No recent interactions</p>
            )}
          </div>
        </Card>

        <Card title="Key Accounts (Top Revenue)">
          <div className="space-y-4">
            {clientsArray
              .sort((a: unknown, b: unknown) => {
                const aTotalBilled = typeof a === 'object' && a !== null && 'totalBilled' in a && typeof a.totalBilled === 'number' ? a.totalBilled : 0;
                const bTotalBilled = typeof b === 'object' && b !== null && 'totalBilled' in b && typeof b.totalBilled === 'number' ? b.totalBilled : 0;
                return bTotalBilled - aTotalBilled;
              })
              .slice(0, 3)
              .map((client: unknown, idx: number) => {
                if (typeof client !== 'object' || client === null) return null;
                const clientName = 'name' in client && typeof client.name === 'string' ? client.name : 'Unknown';
                const clientStatus = 'status' in client && typeof client.status === 'string' ? client.status : 'Active';
                const clientTotalBilled = 'totalBilled' in client && typeof client.totalBilled === 'number' ? client.totalBilled : 0;

                return (
              <div key={idx} className={cn("flex justify-between items-center p-3 rounded-lg border hover:shadow-sm transition-all", theme.surface.default, theme.border.default)}>
                <div>
                  <p className={cn("font-bold text-sm", theme.text.primary)}>{clientName}</p>
                  <p className={cn("text-xs", theme.text.secondary)}>{clientStatus}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono font-bold text-sm", theme.text.primary)}>
                    ${(clientTotalBilled / 1000).toFixed(0)}k
                  </span>
                  <ArrowUpRight className={cn("h-4 w-4", theme.text.tertiary)} />
                </div>
              </div>
                );
              })}
            {clientsArray.length === 0 && (
              <p className={cn("text-sm text-center py-8", theme.text.secondary)}>No clients yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

