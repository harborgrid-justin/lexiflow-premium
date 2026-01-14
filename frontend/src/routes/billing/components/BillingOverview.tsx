/**
 * @module components/billing/BillingOverview
 * @category Billing
 * @description Billing overview with time tracking, invoices, and WIP analytics.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertCircle, Calculator, DollarSign, Users } from 'lucide-react';
import { memo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useBillingOverviewData } from './hooks/useBillingOverviewData';

// Hooks & Context
import { useTheme } from '@/theme';
import { useChartTheme } from '@/shared/ui/organisms/ChartHelpers';

// Components
import { Currency } from '@/shared/ui/atoms/Currency';
import { Card } from '@/shared/ui/molecules/Card';
import { MetricCard } from '@/shared/ui/molecules/MetricCard';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// Types
import { Client } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface BillingOverviewProps {
  /** Optional callback for navigation. */
  onNavigate?: (view: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const BillingOverviewComponent = function BillingOverview({ onNavigate }: BillingOverviewProps) {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();

  // Integrated Data Hook
  const [state] = useBillingOverviewData();
  const {
    wipData,
    realizationData,
    topClients,
    totalWip,
    realizationRate,
    outstandingAmount,
    overdueCount, // Using total overdue count for trend context
    isLoading
  } = state;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("h-32 rounded-lg bg-slate-100 dark:bg-slate-800")} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="h-80 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total WIP (Unbilled)"
          value={totalWip}
          icon={DollarSign}

          className="border-l-4 border-l-blue-600"
          isLive={true}
        />
        <MetricCard
          label="Realization Rate"
          value={`${Math.round(realizationRate)}%`}
          icon={Calculator}
          trend="Target: 90%"
          trendUp={realizationRate >= 90}
          className="border-l-4 border-l-emerald-500"
        />
        <MetricCard
          label="Outstanding (60+ Days)"
          value={outstandingAmount}
          icon={AlertCircle}
          trend={`${overdueCount} Total Overdue`}
          trendUp={false}
          className="border-l-4 border-l-rose-500"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="WIP vs Billed (Top Clients)" subtitle="Revenue potential by client">
          <div className="h-72 min-h-[288px] relative overflow-hidden">
            {wipData.length > 0 ? (
              <ResponsiveContainer width="99%" height="100%" debounce={50}>
                <BarChart data={wipData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: chartTheme.text }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: chartTheme.text }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: chartTheme.grid }}
                    contentStyle={chartTheme.tooltipStyle}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="billed" stackId="a" fill={chartTheme.colors.secondary} name="Billed" radius={[0, 0, 4, 4]} isAnimationActive={true} />
                  <Bar dataKey="wip" stackId="a" fill={chartTheme.colors.primary} name="WIP (Unbilled)" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No WIP data available</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Realization Breakdown" subtitle="Collection efficiency analysis">
          <div className="h-72 flex flex-col items-center justify-center relative min-h-[288px]">
            {realizationData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={realizationData}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {realizationData.map((entry, index: number) => {
                        const name = entry?.name || '';
                        return (
                          <Cell key={`cell-${index}`} fill={name === 'Billed' ? chartTheme.colors.success : chartTheme.colors.danger} />
                        );
                      })}
                    </Pie>
                    <Tooltip contentStyle={chartTheme.tooltipStyle} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                  <p className={cn("text-3xl font-bold", theme.text.primary)}>{Math.round(realizationRate)}%</p>
                  <p className={cn("text-xs uppercase", theme.text.tertiary)}>Collected</p>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400">
                <Calculator className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No realization data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Accounts */}
      <div className={cn("rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <Users className={cn("h-5 w-5 mr-2", theme.primary.text)} /> Top Revenue Accounts
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x dark:divide-slate-700 divide-slate-200">
          {topClients.map((client: Client) => (
            <div
              key={client.id}
              className={cn("flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer")}
              onClick={() => onNavigate && onNavigate('accounts')}
            >
              <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700")}>
                  {client.name ? client.name.substring(0, 2) : '??'}
                </div>
                <div>
                  <p className={cn("font-bold text-sm", theme.text.primary)}>{client.name}</p>
                  <p className={cn("text-xs", theme.text.secondary)}>{client.industry || 'Unknown Industry'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("font-mono font-bold text-sm", theme.text.primary)}><Currency value={client.totalBilled || 0} hideSymbol={false} /></p>
                <span className={cn("text-[10px] font-bold text-green-600")}>Active</span>
              </div>
            </div>
          ))}
          {/* Empty State Fillers if less than 4 clients */}
          {topClients.length === 0 && (
            <div className="p-8 text-center text-slate-400 col-span-2 bg-slate-50 dark:bg-slate-900/50">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No active accounts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BillingOverview = memo(BillingOverviewComponent);
BillingOverview.displayName = 'BillingOverview';
