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

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/utils';
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
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'expenses' | 'alerts'>('overview');

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
    if (percentage >= 90) return theme.status.error;
    if (percentage >= 75) return theme.status.warning;
    if (percentage >= 50) return theme.status.warning;
    return theme.status.success;
  };

  const statusColor = getStatusColor(metrics.utilized);

  return (
    <div className={cn('flex flex-col h-full space-y-6', className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Budget Management</h2>
            <p className={cn("text-sm mt-1", theme.text.secondary)}>
              Track expenses and manage case budget
            </p>
          </div>
          <div className="flex gap-2">
            <button className={cn("flex items-center gap-2 px-4 py-2 border rounded-lg", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}>
              <Download className="h-4 w-4" />
              Export Report
            </button>
            {allowEdit && (
              <button
                onClick={() => console.log('Add Expense clicked')}
                className={cn("flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90", theme.interactive.primary)}
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
          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn("text-xs font-medium", theme.text.secondary)}>Total Budget</p>
              <DollarSign className={cn("h-5 w-5", theme.text.muted)} />
            </div>
            <p className={cn("text-2xl font-bold", theme.text.primary)}>
              {formatCurrency(totalBudget)}
            </p>
          </div>

          {/* Actual Spent */}
          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn("text-xs font-medium", theme.text.secondary)}>Actual Spent</p>
              <TrendingUp className={cn("h-5 w-5", theme.text.muted)} />
            </div>
            <p className={cn("text-2xl font-bold", theme.text.primary)}>
              {formatCurrency(totalActual)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColor.bg, statusColor.text)}>
                {metrics.utilized.toFixed(1)}% utilized
              </div>
            </div>
          </div>

          {/* Remaining */}
          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn("text-xs font-medium", theme.text.secondary)}>Remaining</p>
              {metrics.remaining >= 0 ? (
                <ArrowUpRight className={cn("h-5 w-5", theme.status.success.text)} />
              ) : (
                <ArrowDownRight className={cn("h-5 w-5", theme.status.error.text)} />
              )}
            </div>
            <p className={cn('text-2xl font-bold', metrics.remaining >= 0 ? theme.status.success.text : theme.status.error.text)}>
              {formatCurrency(Math.abs(metrics.remaining))}
            </p>
          </div>

          {/* Burn Rate */}
          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn("text-xs font-medium", theme.text.secondary)}>Daily Burn Rate</p>
              <Clock className={cn("h-5 w-5", theme.text.muted)} />
            </div>
            <p className={cn("text-2xl font-bold", theme.text.primary)}>
              {formatCurrency(metrics.burnRate)}
            </p>
            <p className={cn("text-xs mt-1", theme.text.muted)}>
              Projected: {formatCurrency(metrics.projectedTotal)}
            </p>
          </div>
        </div>

        {/* Active Alerts Banner */}
        {metrics.criticalAlerts > 0 && (
          <div className={cn("mt-4 p-4 border rounded-lg", theme.status.error.bg, theme.status.error.border)}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn("h-5 w-5", theme.status.error.text)} />
              <div>
                <p className={cn("font-semibold", theme.status.error.text)}>
                  {metrics.criticalAlerts} Critical Budget Alert{metrics.criticalAlerts > 1 ? 's' : ''}
                </p>
                <p className={cn("text-sm", theme.status.error.text)}>
                  Immediate attention required to prevent budget overrun
                </p>
              </div>
              <button
                onClick={() => setActiveView('alerts')}
                className={cn("ml-auto px-4 py-2 text-white rounded-lg text-sm hover:opacity-90", theme.status.error.bg)}
              >
                View Alerts
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <div className="flex gap-6">
          {(['overview', 'categories', 'expenses', 'alerts'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeView === view
                  ? cn('border-blue-600', theme.interactive.primary)
                  : cn('border-transparent', theme.text.secondary, `hover:${theme.text.primary}`)
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
            <div className={cn("border rounded-lg p-6", theme.surface.default, theme.border.default)}>
              <h3 className={cn("font-semibold mb-4", theme.text.primary)}>Budget Progress</h3>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm", theme.text.secondary)}>
                    {formatCurrency(totalActual)} of {formatCurrency(totalBudget)}
                  </span>
                  <span className={cn('text-sm font-medium', statusColor.text)}>
                    {metrics.utilized.toFixed(1)}%
                  </span>
                </div>
                <div className={cn("w-full rounded-full h-3", theme.surface.raised)}>
                  <div
                    className={cn('h-3 rounded-full transition-all',
                      metrics.utilized >= 90 ? theme.status.error.bg :
                        metrics.utilized >= 75 ? theme.status.warning.bg :
                          metrics.utilized >= 50 ? theme.status.warning.bg :
                            theme.status.success.bg
                    )}
                    style={{ width: `${Math.min(metrics.utilized, 100)}%` }}
                  />
                </div>
              </div>

              {/* Forecast */}
              {metrics.totalForecasted > totalBudget && (
                <div className={cn("mt-4 p-3 border rounded-lg", theme.status.warning.bg, theme.status.warning.border)}>
                  <div className={cn("flex items-center gap-2", theme.status.warning.text)}>
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
              <div className={cn("border rounded-lg p-4", theme.surface.default, theme.border.default)}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", theme.surface.active)}>
                    <PieChart className={cn("h-5 w-5", theme.interactive.primary)} />
                  </div>
                  <p className={cn("text-sm font-medium", theme.text.secondary)}>Categories</p>
                </div>
                <p className={cn("text-2xl font-bold", theme.text.primary)}>{categories.length}</p>
                <p className={cn("text-xs mt-1", theme.text.muted)}>Budget categories</p>
              </div>

              <div className={cn("border rounded-lg p-4", theme.surface.default, theme.border.default)}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", theme.surface.subtle)}>
                    <CheckCircle className={cn("h-5 w-5", theme.status.success.text)} />
                  </div>
                  <p className={cn("text-sm font-medium", theme.text.secondary)}>Expenses</p>
                </div>
                <p className={cn("text-2xl font-bold", theme.text.primary)}>{expenses.length}</p>
                <p className={cn("text-xs mt-1", theme.text.muted)}>
                  {expenses.filter(e => e.status === 'approved').length} approved
                </p>
              </div>

              <div className={cn("border rounded-lg p-4", theme.surface.default, theme.border.default)}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", theme.surface.subtle)}>
                    <Bell className={cn("h-5 w-5", theme.status.warning.text)} />
                  </div>
                  <p className={cn("text-sm font-medium", theme.text.secondary)}>Alerts</p>
                </div>
                <p className={cn("text-2xl font-bold", theme.text.primary)}>{metrics.activeAlerts}</p>
                <p className={cn("text-xs mt-1", theme.text.muted)}>
                  {metrics.criticalAlerts} critical
                </p>
              </div>
            </div>

            {/* Top Categories */}
            <div className={cn("border rounded-lg p-6", theme.surface.default, theme.border.default)}>
              <h3 className={cn("font-semibold mb-4", theme.text.primary)}>Top Spending Categories</h3>
              <div className="space-y-3">
                {categories
                  .sort((a, b) => b.actual - a.actual)
                  .slice(0, 5)
                  .map(category => {
                    const percentage = calculatePercentage(category.actual, category.budgeted);
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn("text-sm font-medium", theme.text.primary)}>
                            {category.name}
                          </span>
                          <span className={cn("text-sm", theme.text.secondary)}>
                            {formatCurrency(category.actual)} / {formatCurrency(category.budgeted)}
                          </span>
                        </div>
                        <div className={cn("w-full rounded-full h-2", theme.surface.raised)}>
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
                  className={cn("border rounded-lg p-4", theme.surface.default, theme.border.default)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <div>
                        <h4 className={cn("font-semibold", theme.text.primary)}>
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className={cn("text-sm", theme.text.secondary)}>
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {allowEdit && (
                      <button className={cn(theme.text.muted, `hover:${theme.text.primary}`)}>
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className={cn("text-xs", theme.text.secondary)}>Budgeted</p>
                      <p className={cn("text-lg font-semibold", theme.text.primary)}>
                        {formatCurrency(category.budgeted)}
                      </p>
                    </div>
                    <div>
                      <p className={cn("text-xs", theme.text.secondary)}>Actual</p>
                      <p className={cn("text-lg font-semibold", theme.text.primary)}>
                        {formatCurrency(category.actual)}
                      </p>
                    </div>
                    <div>
                      <p className={cn("text-xs", theme.text.secondary)}>Variance</p>
                      <p className={cn('text-lg font-semibold', variance >= 0 ? theme.status.success.text : theme.status.error.text)}>
                        {formatCurrency(Math.abs(variance))}
                      </p>
                    </div>
                    <div>
                      <p className={cn("text-xs", theme.text.secondary)}>Forecasted</p>
                      <p className={cn("text-lg font-semibold", theme.text.primary)}>
                        {formatCurrency(category.forecasted || category.actual)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={cn("flex-1 rounded-full h-2", theme.surface.raised)}>
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
          <div className={cn("border rounded-lg", theme.surface.default, theme.border.default)}>
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <DollarSign className={cn("h-12 w-12 mb-4", theme.text.muted)} />
                <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>
                  No expenses recorded
                </h3>
                <p className={cn("text-sm mb-4", theme.text.secondary)}>
                  Start tracking expenses to monitor your budget
                </p>
                {allowEdit && (
                  <button
                    onClick={() => console.log('Add First Expense clicked')}
                    className={cn("flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90", theme.interactive.primary)}
                  >
                    <Plus className="h-4 w-4" />
                    Add First Expense
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className={cn(theme.surface.subtle)}>
                  <tr>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", theme.text.secondary)}>
                      Date
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", theme.text.secondary)}>
                      Description
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", theme.text.secondary)}>
                      Category
                    </th>
                    <th className={cn("px-4 py-3 text-right text-xs font-medium uppercase", theme.text.secondary)}>
                      Amount
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", theme.text.secondary)}>
                      Status
                    </th>
                    {allowEdit && (
                      <th className={cn("px-4 py-3 text-right text-xs font-medium uppercase", theme.text.secondary)}>
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className={cn("divide-y", theme.border.default)}>
                  {expenses.map(expense => (
                    <tr key={expense.id}>
                      <td className={cn("px-4 py-3 text-sm", theme.text.primary)}>
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className={cn("px-4 py-3 text-sm", theme.text.primary)}>
                        {expense.description}
                      </td>
                      <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                        {expense.category}
                      </td>
                      <td className={cn("px-4 py-3 text-sm text-right font-medium", theme.text.primary)}>
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-block px-2 py-1 text-xs font-medium rounded-full',
                            expense.status === 'approved' && cn(theme.status.success.bg, theme.status.success.text),
                            expense.status === 'pending' && cn(theme.status.warning.bg, theme.status.warning.text),
                            expense.status === 'rejected' && cn(theme.status.error.bg, theme.status.error.text)
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
                                className={cn("hover:opacity-80", theme.status.success.text)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onRejectExpense?.(expense.id)}
                                className={cn("hover:opacity-80", theme.status.error.text)}
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
                  alert.type === 'critical' && cn(theme.status.error.bg, theme.status.error.border),
                  alert.type === 'warning' && cn(theme.status.warning.bg, theme.status.warning.border),
                  alert.type === 'info' && cn(theme.status.info.bg, theme.status.info.border)
                )}
              >
                <div className="flex items-start gap-3">
                  <Bell
                    className={cn(
                      'h-5 w-5 mt-0.5',
                      alert.type === 'critical' && theme.status.error.text,
                      alert.type === 'warning' && theme.status.warning.text,
                      alert.type === 'info' && theme.status.info.text
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={cn(
                          'font-semibold',
                          alert.type === 'critical' && theme.status.error.text,
                          alert.type === 'warning' && theme.status.warning.text,
                          alert.type === 'info' && theme.status.info.text
                        )}
                      >
                        Budget Alert: {alert.threshold}% Threshold
                      </h4>
                      {alert.triggered && (
                        <span className={cn("px-2 py-0.5 text-xs text-white rounded-full", theme.status.error.bg)}>
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-sm mb-2',
                        alert.type === 'critical' && theme.status.error.text,
                        alert.type === 'warning' && theme.status.warning.text,
                        alert.type === 'info' && theme.status.info.text
                      )}
                    >
                      {alert.message}
                    </p>
                    {alert.triggeredAt && (
                      <p className={cn("text-xs", theme.text.secondary)}>
                        Triggered on {new Date(alert.triggeredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {allowEdit && (
                    <button className={cn(theme.text.muted, `hover:${theme.text.primary}`)}>
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className={cn("h-12 w-12 mb-4", theme.text.muted)} />
                <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>
                  No budget alerts
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>
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
