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
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, AlertCircle, Users, Calculator } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useChartTheme } from '../common/ChartHelpers';

// Components
import { Card } from '../common/Card';
import { MetricCard, Currency } from '../common/Primitives';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { WIPStat } from '../../types';

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

export const BillingOverview: React.FC<BillingOverviewProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();
  
  // Enterprise Data Access: Parallel Queries with safety check
  const { data: rawWipData = [] } = useQuery<WIPStat[]>(
      ['billing', 'wipStats'],
      () => DataService.billing ? DataService.billing.getWIPStats() : Promise.resolve([])
  );
  
  const { data: rawRealizationData = [] } = useQuery(
      ['billing', 'realization'],
      () => DataService.billing ? DataService.billing.getRealizationStats() : Promise.resolve([])
  );
  
  const { data: rawTopClients = [] } = useQuery(
      ['billing', 'topAccounts'],
      () => DataService.billing ? DataService.billing.getTopAccounts() : Promise.resolve([])
  );

  // Defensive array validation - ensure data is array before using array methods
  const wipData = Array.isArray(rawWipData) ? rawWipData : [];
  const realizationData = Array.isArray(rawRealizationData) ? rawRealizationData : [];
  const topClients = Array.isArray(rawTopClients) ? rawTopClients : [];

  const totalWip = wipData.reduce((acc: number, curr: any) => acc + (curr.wip || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
            label="Total WIP (Unbilled)"
            value={totalWip} // Pass number for hydration animation
            icon={DollarSign}
            trend="+12% MoM"
            trendUp={true}
            className="border-l-4 border-l-blue-600"
            isLive={true} // Simulate live financial feed
        />
        <MetricCard
            label="Realization Rate"
            value="92.4%"
            icon={Calculator}
            trend="Target: 90%"
            trendUp={true}
            className="border-l-4 border-l-emerald-500"
        />
        <MetricCard
            label="Outstanding (60+ Days)"
            value={12450} // Pass number for hydration animation
            icon={AlertCircle}
            trend="3 Invoices Overdue"
            trendUp={false}
            className="border-l-4 border-l-rose-500"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="WIP vs Billed (Top Clients)" subtitle="Revenue potential by client">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wipData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid}/>
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12} 
                    tick={{fill: chartTheme.text}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12} 
                    tick={{fill: chartTheme.text}}
                    tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                    cursor={{fill: chartTheme.grid}}
                    contentStyle={chartTheme.tooltipStyle}
                />
                <Legend iconType="circle" />
                <Bar dataKey="billed" stackId="a" fill={chartTheme.colors.secondary} name="Billed" radius={[0, 0, 4, 4]} isAnimationActive={true} />
                <Bar dataKey="wip" stackId="a" fill={chartTheme.colors.primary} name="WIP (Unbilled)" radius={[4, 4, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Realization Breakdown" subtitle="Collection efficiency analysis">
            <div className="h-72 flex flex-col items-center justify-center relative">
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
                            {realizationData.map((e: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={e.name === 'Billed' ? chartTheme.colors.success : chartTheme.colors.danger} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={chartTheme.tooltipStyle}/>
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                    <p className={cn("text-3xl font-bold", theme.text.primary)}>92%</p>
                    <p className={cn("text-xs uppercase", theme.text.tertiary)}>Collected</p>
                </div>
            </div>
        </Card>
      </div>

      {/* Top Accounts */}
      <div className={cn("rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
            <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                <Users className={cn("h-5 w-5 mr-2", theme.primary.text)}/> Top Revenue Accounts
            </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x dark:divide-slate-700 divide-slate-200">
             {topClients.map((client: any) => (
                 <div 
                    key={client.id} 
                    className={cn("flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer")}
                    onClick={() => onNavigate && onNavigate('accounts')}
                 >
                    <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700")}>
                            {client.name.substring(0, 2)}
                        </div>
                        <div>
                            <p className={cn("font-bold text-sm", theme.text.primary)}>{client.name}</p>
                            <p className={cn("text-xs", theme.text.secondary)}>{client.industry}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={cn("font-mono font-bold text-sm", theme.text.primary)}><Currency value={client.totalBilled} hideSymbol={false}/></p>
                        <span className={cn("text-[10px] font-bold text-green-600")}>Active</span>
                    </div>
                 </div>
             ))}
        </div>
      </div>
    </div>
  );
};