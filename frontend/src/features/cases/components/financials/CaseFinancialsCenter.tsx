/**
 * Matter Financials Center - Comprehensive Financial Management
 *
 * @module MatterFinancialsCenter
 * @description Complete financial oversight and billing management
 *
 * Features:
 * - Billing overview and analytics
 * - Budget tracking and forecasting
 * - Expense management
 * - Time entry overview
 * - Profitability analysis
 * - Realization rates
 * - Collection tracking
 * - Financial reports
 * - Invoice generation
 * - Trust accounting
 */

import { api } from '@/api';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { cn } from '@/shared/lib/cn';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';

import { Badge } from '@/shared/ui/atoms/Badge/Badge';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import {
  Clock,
  DollarSign,
  Download,
  TrendingUp,
  Wallet
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId?: string;
  totalAmount?: number;
  amount?: number;
  status?: string;
  invoiceDate?: string;
  date?: string;
  createdAt?: string;
  caseTitle?: string;
  matterName?: string;
}

interface Expense {
  id: string;
  description: string;
  amount?: number;
  cost?: number;
  date?: string;
  incurredAt?: string;
}

interface Matter {
  id: string;
  title: string;
}

interface TimeEntry {
  date?: string;
  createdAt?: string;
  duration?: number;
  rate?: number;
}

export const CaseFinancialsCenter: React.FC<{ caseId?: string }> = ({ caseId }) => {
  const { isDark } = useTheme();
  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'ytd' | 'all'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'billing' | 'expenses' | 'budget'>('overview');

  // Fetch invoices
  const { data: invoices } = useQuery<Invoice[]>(
    ['billing', 'invoices', caseId],
    () => api.billing.getInvoices(caseId ? { caseId } : undefined)
  );

  // Fetch time entries
  const { data: timeEntries } = useQuery<TimeEntry[]>(
    ['billing', 'time-entries', caseId],
    () => api.billing.getTimeEntries(caseId ? { caseId } : undefined)
  );

  // Fetch expenses
  const { data: expenses } = useQuery<Expense[]>(
    ['billing', 'expenses', caseId],
    () => api.expenses.getAll(caseId ? { caseId } : undefined)
  );

  // Fetch matters for revenue attribution
  const { data: matters } = useQuery<Matter[]>(
    ['matters', 'all'],
    () => api.cases.getAll()
  );

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    if (dateRange === '30d') cutoffDate.setDate(now.getDate() - 30);
    else if (dateRange === '90d') cutoffDate.setDate(now.getDate() - 90);
    else if (dateRange === 'ytd') cutoffDate.setMonth(0, 1);

    const recentInvoices = invoices?.filter(inv =>
      inv.createdAt && new Date(inv.createdAt) >= cutoffDate
    ) || [];

    const recentTimeEntries = timeEntries?.filter(t => {
      const entryDate = t.date || (t.createdAt ? t.createdAt : new Date().toISOString());
      return new Date(entryDate) >= cutoffDate;
    }) || [];

    const totalRevenue = recentInvoices.reduce((sum, inv) =>
      sum + (inv.totalAmount || inv.amount || 0), 0
    );


    const billableHours = recentTimeEntries.reduce((sum, t) =>
      sum + (t.duration || 0), 0
    );

    const totalBilled = recentTimeEntries.reduce((sum, t) =>
      sum + ((t.duration || 0) * (t.rate || 150)), 0
    );

    const realizationRate = totalBilled > 0
      ? (totalRevenue / totalBilled) * 100
      : 0;

    const outstandingAR = (invoices as any[] | undefined)?.filter(inv =>
      inv.status === 'PENDING' || inv.status === 'OVERDUE'
    ).reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0) || 0;

    return {
      totalRevenue,
      billableHours: Math.round(billableHours),
      realizationRate: Math.round(realizationRate * 10) / 10,
      outstandingAR,
    };
  }, [invoices, timeEntries, dateRange]);

  return (
    <div className={cn('h-full flex flex-col', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <div className={cn('border-b px-6 py-4', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
        <div className="flex items-center justify-between">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className={cn(
              'px-4 py-2 rounded-lg border text-sm',
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            )}
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className={cn('flex items-center gap-2 p-1 rounded-lg', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
        <button
          onClick={() => setViewMode('overview')}
          className={cn('px-4 py-2 rounded text-sm font-medium transition-colors',
            viewMode === 'overview'
              ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
              : isDark ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('billing')}
          className={cn('px-4 py-2 rounded text-sm font-medium transition-colors',
            viewMode === 'billing'
              ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
              : isDark ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          Billing
        </button>
        <button
          onClick={() => setViewMode('expenses')}
          className={cn('px-4 py-2 rounded text-sm font-medium transition-colors',
            viewMode === 'expenses'
              ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
              : isDark ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          Expenses
        </button>
        <button
          onClick={() => setViewMode('budget')}
          className={cn('px-4 py-2 rounded text-sm font-medium transition-colors',
            viewMode === 'budget'
              ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
              : isDark ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          Budget
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <FinancialKPICard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${(financialMetrics.totalRevenue / 1000000).toFixed(1)}M`}
            change={dateRange}
            isDark={isDark}
          />
          <FinancialKPICard
            icon={Clock}
            title="Billable Hours"
            value={financialMetrics.billableHours.toLocaleString()}
            change={`${dateRange} period`}
            isDark={isDark}
          />
          <FinancialKPICard
            icon={TrendingUp}
            title="Realization Rate"
            value={`${financialMetrics.realizationRate}%`}
            change="Revenue vs billed"
            isDark={isDark}
          />
          <FinancialKPICard
            icon={Wallet}
            title="Outstanding AR"
            value={`$${(financialMetrics.outstandingAR / 1000).toFixed(0)}K`}
            change="Pending invoices"
            isDark={isDark}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className={cn('text-lg font-semibold mb-4', isDark ? 'text-slate-100' : 'text-slate-900')}>
              Revenue Trend
            </h3>
            <div className={cn('h-64 w-full', isDark ? 'bg-slate-800/50' : 'bg-white')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={
                  // Calculate last 6 months revenue dynamically
                  Array.from({ length: 6 }).map((_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - (5 - i));
                    const monthName = d.toLocaleString('default', { month: 'short' });
                    const total = invoices?.filter(inv => {
                      const invDate = new Date(inv.invoiceDate || inv.createdAt || inv.date || '');
                      return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
                    }).reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0) || 0;
                    return { name: monthName, value: total };
                  })
                }>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} tickFormatter={(value) => `$${value / 1000}k`} />
                  <RechartsTooltip
                    cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }}
                    contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }}
                    formatter={(value: number, name: any): any => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : isDark ? '#475569' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className={cn('text-lg font-semibold mb-4', isDark ? 'text-slate-100' : 'text-slate-900')}>
              Top Matters by Revenue
            </h3>
            <div className="space-y-3">
              {matters && (() => {
                const matterRevenue = matters.map(matter => {
                  const matterInvoices = invoices?.filter(inv => inv.caseId === matter.id) || [];
                  const revenue = matterInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
                  return { matter, revenue };
                }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

                const totalRevenue = matterRevenue.reduce((sum, mr) => sum + mr.revenue, 0);

                return matterRevenue.map(({ matter, revenue }) => (
                  <MatterRevenueItem
                    key={matter.id}
                    matter={matter.title}
                    revenue={revenue}
                    percentage={totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0}
                    isDark={isDark}
                  />
                ));
              })()}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
                Recent Expenses
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('expenses')}>View All</Button>
            </div>
            <div className="space-y-4">
              {(expenses || []).slice(0, 3).map((exp) => (
                <div key={exp.id || Math.random()} className={cn('p-4 rounded-lg border', isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white')}>
                  <div className={cn('font-medium mb-1', isDark ? 'text-slate-100' : 'text-slate-900')}>
                    {exp.description || 'Expense Entry'}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      {new Date(exp.date || exp.incurredAt || new Date()).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-red-500">
                      ${(exp.amount || exp.cost || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!expenses || expenses.length === 0) && (
                <div className="text-center py-4 text-slate-500 text-sm">No recent expenses recorded</div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
                Recent Invoices
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('billing')}>View All</Button>
            </div>
            <div className="space-y-3">
              {(invoices || []).slice(0, 5).map((inv) => (
                <InvoiceItem
                  key={inv.id || inv.invoiceNumber}
                  invoiceNumber={inv.invoiceNumber}
                  matter={inv.matterName || inv.caseTitle || 'Case Invoice'}
                  amount={inv.totalAmount || inv.amount || 0}
                  status={(inv.status?.toLowerCase() || 'pending') as 'paid' | 'pending' | 'overdue'}
                  date={new Date(inv.date || inv.invoiceDate || inv.createdAt).toLocaleDateString()}
                  isDark={isDark}
                />
              ))}
              {(!invoices || invoices.length === 0) && (
                <div className="text-center py-4 text-slate-500 text-sm">No invoices found</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const FinancialKPICard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  trend?: 'up' | 'down';
  isDark: boolean;
}> = ({ icon: Icon, title, value, change, trend = 'up', isDark }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={cn('text-sm font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {title}
        </div>
        <div className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
          {value}
        </div>
        <div className={cn('text-sm mt-2',
          trend === 'up' ? 'text-emerald-500' : 'text-red-500'
        )}>
          {change}
        </div>
      </div>
      <div className={cn('p-3 rounded-lg', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
        <Icon className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
      </div>
    </div>
  </Card>
);

const MatterRevenueItem: React.FC<{
  matter: string;
  revenue: number;
  percentage: number;
  isDark: boolean;
}> = ({ matter, revenue, percentage, isDark }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
        {matter}
      </span>
      <span className={cn('text-sm font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
        ${(revenue / 1000).toFixed(0)}K
      </span>
    </div>
    <div className={cn('h-2 rounded-full', isDark ? 'bg-slate-700' : 'bg-slate-200')}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const InvoiceItem: React.FC<{
  invoiceNumber: string;
  matter: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  isDark: boolean;
}> = ({ invoiceNumber, matter, amount, status, date, isDark }) => (
  <div className={cn('p-4 rounded-lg border', isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white')}>
    <div className="flex items-start justify-between mb-2">
      <div>
        <div className={cn('font-medium', isDark ? 'text-slate-100' : 'text-slate-900')}>
          {invoiceNumber}
        </div>
        <div className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {matter}
        </div>
      </div>
      <Badge variant={status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'error'}>
        {status}
      </Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
        ${amount.toLocaleString()}
      </span>
      <span className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-500')}>
        {date}
      </span>
    </div>
  </div>
);
