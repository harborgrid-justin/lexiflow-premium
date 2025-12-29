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

import React, { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, Clock, FileText, PieChart, BarChart3,
  Download, Filter, Calendar, CreditCard, Receipt, Wallet
} from 'lucide-react';
import { useQuery } from '@/hooks/useQueryHooks';
import { api } from '@/api';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms';
import { Card } from '@/components/molecules';
import { Badge } from '@/components/atoms';

export const CaseFinancialsCenter: React.FC = () => {
  const { mode, isDark } = useTheme();
  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'ytd' | 'all'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'billing' | 'expenses' | 'budget'>('overview');

  // Fetch invoices
  const { data: invoices } = useQuery(
    ['billing', 'invoices'],
    () => api.billing.getInvoices()
  );

  // Fetch time entries
  const { data: timeEntries } = useQuery(
    ['billing', 'time-entries'],
    () => api.billing.getTimeEntries()
  );

  // Fetch matters for revenue attribution
  const { data: matters } = useQuery(
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
      new Date(inv.createdAt) >= cutoffDate
    ) || [];
    
    const recentTimeEntries = timeEntries?.filter(t => {
      const entryDate = t.date || (t.createdAt ? t.createdAt : new Date().toISOString());
      return new Date(entryDate) >= cutoffDate;
    }) || [];

    const totalRevenue = recentInvoices.reduce((sum, inv) => 
      sum + (inv.amount || 0), 0
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

    const outstandingAR = invoices?.filter(inv => 
      inv.status === 'PENDING' || inv.status === 'OVERDUE'
    ).reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

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
            <div className={cn('h-64 flex items-center justify-center rounded border', isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50')}>
              <BarChart3 className={cn('w-12 h-12', isDark ? 'text-slate-600' : 'text-slate-300')} />
              <span className={cn('ml-3 text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Revenue chart will be rendered here
              </span>
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
                  const revenue = matterInvoices.reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0);
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
                Budget Performance
              </h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              <BudgetPerformanceItem
                matter="Smith v. Acme Corp"
                budget={150000}
                spent={178000}
                remaining={-28000}
                isDark={isDark}
              />
              <BudgetPerformanceItem
                matter="Tech Startup M&A"
                budget={200000}
                spent={195000}
                remaining={5000}
                isDark={isDark}
              />
              <BudgetPerformanceItem
                matter="Johnson Estate"
                budget={50000}
                spent={45000}
                remaining={5000}
                isDark={isDark}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
                Recent Invoices
              </h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              <InvoiceItem
                invoiceNumber="INV-2025-0234"
                matter="Smith v. Acme Corp"
                amount={25000}
                status="paid"
                date="Dec 15, 2025"
                isDark={isDark}
              />
              <InvoiceItem
                invoiceNumber="INV-2025-0235"
                matter="Tech Startup M&A"
                amount={18500}
                status="pending"
                date="Dec 18, 2025"
                isDark={isDark}
              />
              <InvoiceItem
                invoiceNumber="INV-2025-0236"
                matter="Johnson Estate"
                amount={8200}
                status="overdue"
                date="Dec 1, 2025"
                isDark={isDark}
              />
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

const BudgetPerformanceItem: React.FC<{
  matter: string;
  budget: number;
  spent: number;
  remaining: number;
  isDark: boolean;
}> = ({ matter, budget, spent, remaining, isDark }) => {
  const percentageSpent = (spent / budget) * 100;
  const isOverBudget = remaining < 0;

  return (
    <div className={cn('p-4 rounded-lg border', isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white')}>
      <div className={cn('font-medium mb-2', isDark ? 'text-slate-100' : 'text-slate-900')}>
        {matter}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
            Budget: ${(budget / 1000).toFixed(0)}K
          </span>
          <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
            Spent: ${(spent / 1000).toFixed(0)}K
          </span>
        </div>
        <div className={cn('h-2 rounded-full', isDark ? 'bg-slate-700' : 'bg-slate-200')}>
          <div
            className={cn('h-full rounded-full', isOverBudget ? 'bg-red-500' : 'bg-emerald-500')}
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
          />
        </div>
        <div className={cn('text-sm font-semibold',
          isOverBudget ? 'text-red-500' : 'text-emerald-500'
        )}>
          {remaining >= 0 ? `$${(remaining / 1000).toFixed(0)}K remaining` : `$${Math.abs(remaining / 1000).toFixed(0)}K over budget`}
        </div>
      </div>
    </div>
  );
};

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
