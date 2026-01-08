/**
 * Case Budget Management Component
 *
 * Enterprise budget tracking and financial management:
 * - Real-time budget vs actual tracking
 * - Customizable budget alerts and thresholds
 * - Cost category breakdown and analysis
 * - Forecasting and burn rate calculations
 * - Expense approval workflows
 * - Budget variance reporting
 * - Integration with time tracking and billing
 *
 * @module components/enterprise/CaseManagement/CaseBudget
 */

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CheckCircle, Clock,
  DollarSign,
  Download,
  Edit,
  PieChart,
  Plus,
  Settings,
  Trash2,
  TrendingUp
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  forecasted?: number;
  description?: string;
  color?: string;
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  threshold: number; // Percentage
  message: string;
  triggered: boolean;
  triggeredAt?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  receipt?: string;
}

export interface BudgetPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  actual: number;
}

export interface CaseBudgetProps {
  caseId: string;
  totalBudget: number;
  totalActual: number;
  categories: BudgetCategory[];
  alerts?: BudgetAlert[];
  expenses?: Expense[];
  periods?: BudgetPeriod[];
  onUpdateBudget?: (categoryId: string, amount: number) => void;
  onAddExpense?: (expense: Partial<Expense>) => void;
  onApproveExpense?: (expenseId: string) => void;
  onRejectExpense?: (expenseId: string) => void;
  onUpdateAlert?: (alert: BudgetAlert) => void;
  allowEdit?: boolean;
  className?: string;
}

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: 'attorney-fees', name: 'Attorney Fees', budgeted: 50000, actual: 32500, forecasted: 48000, color: '#3B82F6' },
  { id: 'expert-witnesses', name: 'Expert Witnesses', budgeted: 15000, actual: 8500, forecasted: 14000, color: '#8B5CF6' },
  { id: 'court-fees', name: 'Court Fees & Filings', budgeted: 5000, actual: 3200, forecasted: 4500, color: '#10B981' },
  { id: 'discovery', name: 'Discovery Costs', budgeted: 10000, actual: 7800, forecasted: 9500, color: '#F59E0B' },
  { id: 'travel', name: 'Travel & Expenses', budgeted: 8000, actual: 4200, forecasted: 7000, color: '#EF4444' },
  { id: 'research', name: 'Legal Research', budgeted: 3000, actual: 1800, forecasted: 2800, color: '#06B6D4' },
  { id: 'other', name: 'Other Costs', budgeted: 4000, actual: 2100, forecasted: 3500, color: '#6B7280' },
];

const DEFAULT_ALERTS: BudgetAlert[] = [
  { id: 'alert-1', type: 'warning', threshold: 75, message: 'Budget at 75% - Review spending', triggered: true, triggeredAt: '2024-01-15' },
  { id: 'alert-2', type: 'critical', threshold: 90, message: 'Budget at 90% - Immediate attention required', triggered: false },
  { id: 'alert-3', type: 'info', threshold: 50, message: 'Budget at 50% - Mid-point reached', triggered: true, triggeredAt: '2024-01-01' },
];

// ============================================================================
// Helper Functions
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculatePercentage = (actual: number, budget: number): number => {
  if (budget === 0) return 0;
  return (actual / budget) * 100;
};

const calculateVariance = (actual: number, budget: number): number => {
  return budget - actual;
};

const getBurnRate = (actual: number, days: number): number => {
  if (days === 0) return 0;
  return actual / days;
};

// ============================================================================
// Component
// ============================================================================

export const CaseBudget: React.FC<CaseBudgetProps> = ({
  totalBudget,
  totalActual,
  categories = DEFAULT_CATEGORIES,
  alerts = DEFAULT_ALERTS,
  expenses = [],
  onApproveExpense,
  onRejectExpense,
  allowEdit = false,
  className,
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'expenses' | 'alerts'>('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Calculate metrics
  const metrics = useMemo(() => {
    const utilized = calculatePercentage(totalActual, totalBudget);
    console.log('metrics data:', metrics);
    const remaining = totalBudget - totalActual;
    const variance = calculateVariance(totalActual, totalBudget);
    const totalForecasted = categories.reduce((sum, cat) => sum + (cat.forecasted || cat.actual), 0);
    const projectedOverrun = totalForecasted - totalBudget;

    // Calculate burn rate (assuming 30 days for demo)
    const daysElapsed = 30;
    const burnRate = getBurnRate(totalActual, daysElapsed);
    const projectedTotal = burnRate * 90; // Assuming 90-day case

    // Active alerts
    const activeAlerts = alerts.filter(a => a.triggered);
    const criticalAlerts = activeAlerts.filter(a => a.type === 'critical');

    return {
      utilized,
      remaining,
      variance,
      totalForecasted,
      projectedOverrun,
      burnRate,
      projectedTotal,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
    };
  }, [totalBudget, totalActual, categories, alerts]);

  // Get status color
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-300 dark:border-red-700' };
    if (percentage >= 75) return { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' };
    if (percentage >= 50) return { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700' };
    return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-300 dark:border-green-700' };
  };

  const statusColor = getStatusColor(metrics.utilized);

  return (
    <div className={cn('flex flex-col h-full space-y-6', className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track expenses and manage case budget
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              <Download className="h-4 w-4" />
              Export Report
            </button>
            {allowEdit && (
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Budget */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Budget</p>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalBudget)}
            </p>
          </div>

          {/* Actual Spent */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Actual Spent</p>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalActual)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColor.bg, statusColor.text)}>
                {metrics.utilized.toFixed(1)}% utilized
              </div>
            </div>
          </div>

          {/* Remaining */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Remaining</p>
              {metrics.remaining >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className={cn('text-2xl font-bold', metrics.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
              {formatCurrency(Math.abs(metrics.remaining))}
            </p>
          </div>

          {/* Burn Rate */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Daily Burn Rate</p>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(metrics.burnRate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Projected: {formatCurrency(metrics.projectedTotal)}
            </p>
          </div>
        </div>

        {/* Active Alerts Banner */}
        {metrics.criticalAlerts > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">
                  {metrics.criticalAlerts} Critical Budget Alert{metrics.criticalAlerts > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Immediate attention required to prevent budget overrun
                </p>
              </div>
              <button
                onClick={() => setActiveView('alerts')}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                View Alerts
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6">
          {(['overview', 'categories', 'expenses', 'alerts'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeView === view
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Budget Progress */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Budget Progress</h3>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(totalActual)} of {formatCurrency(totalBudget)}
                  </span>
                  <span className={cn('text-sm font-medium', statusColor.text)}>
                    {metrics.utilized.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div
                    className={cn('h-3 rounded-full transition-all',
                      metrics.utilized >= 90 ? 'bg-red-600' :
                        metrics.utilized >= 75 ? 'bg-orange-500' :
                          metrics.utilized >= 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                    )}
                    style={{ width: `${Math.min(metrics.utilized, 100)}%` }}
                  />
                </div>
              </div>

              {/* Forecast */}
              {metrics.totalForecasted > totalBudget && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
                  <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Projected overrun: {formatCurrency(metrics.projectedOverrun)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                    <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Budget categories</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Expenses</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenses.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {expenses.filter(e => e.status === 'approved').length} approved
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                    <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Alerts</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeAlerts}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metrics.criticalAlerts} critical
                </p>
              </div>
            </div>

            {/* Top Categories */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h3>
              <div className="space-y-3">
                {categories
                  .sort((a, b) => b.actual - a.actual)
                  .slice(0, 5)
                  .map(category => {
                    const percentage = calculatePercentage(category.actual, category.budgeted);
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(category.actual)} / {formatCurrency(category.budgeted)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: category.color || '#3B82F6',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeView === 'categories' && (
          <div className="space-y-4">
            {categories.map(category => {
              const percentage = calculatePercentage(category.actual, category.budgeted);
              const variance = calculateVariance(category.actual, category.budgeted);
              const statusColor = getStatusColor(percentage);

              return (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {allowEdit && (
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Budgeted</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(category.budgeted)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Actual</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(category.actual)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Variance</p>
                      <p className={cn('text-lg font-semibold', variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                        {formatCurrency(Math.abs(variance))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Forecasted</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(category.forecasted || category.actual)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: category.color || '#3B82F6',
                        }}
                      />
                    </div>
                    <span className={cn('text-sm font-medium', statusColor.text)}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Expenses Tab */}
        {activeView === 'expenses' && (
          <div className="border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No expenses recorded
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Start tracking expenses to monitor your budget
                </p>
                {allowEdit && (
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Expense
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                      Status
                    </th>
                    {allowEdit && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map(expense => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {expense.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-block px-2 py-1 text-xs font-medium rounded-full',
                            expense.status === 'approved' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                            expense.status === 'pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                            expense.status === 'rejected' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {expense.status}
                        </span>
                      </td>
                      {allowEdit && (
                        <td className="px-4 py-3 text-right">
                          {expense.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => onApproveExpense?.(expense.id)}
                                className="text-green-600 hover:text-green-700 dark:text-green-400"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onRejectExpense?.(expense.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeView === 'alerts' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  'border rounded-lg p-4',
                  alert.type === 'critical' && 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
                  alert.type === 'warning' && 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
                  alert.type === 'info' && 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <Bell
                    className={cn(
                      'h-5 w-5 mt-0.5',
                      alert.type === 'critical' && 'text-red-600 dark:text-red-400',
                      alert.type === 'warning' && 'text-orange-600 dark:text-orange-400',
                      alert.type === 'info' && 'text-blue-600 dark:text-blue-400'
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={cn(
                          'font-semibold',
                          alert.type === 'critical' && 'text-red-900 dark:text-red-200',
                          alert.type === 'warning' && 'text-orange-900 dark:text-orange-200',
                          alert.type === 'info' && 'text-blue-900 dark:text-blue-200'
                        )}
                      >
                        Budget Alert: {alert.threshold}% Threshold
                      </h4>
                      {alert.triggered && (
                        <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-sm mb-2',
                        alert.type === 'critical' && 'text-red-700 dark:text-red-300',
                        alert.type === 'warning' && 'text-orange-700 dark:text-orange-300',
                        alert.type === 'info' && 'text-blue-700 dark:text-blue-300'
                      )}
                    >
                      {alert.message}
                    </p>
                    {alert.triggeredAt && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Triggered on {new Date(alert.triggeredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {allowEdit && (
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No budget alerts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure alerts to monitor budget thresholds
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
