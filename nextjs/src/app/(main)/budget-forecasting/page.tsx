/**
 * Budget Forecasting Dashboard - Server Component with Data Fetching
 * Matter budgets with actual vs forecast comparison and variance analysis
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Budget Forecasting | LexiFlow',
  description: 'Matter budget forecasting with actual vs forecast variance analysis',
};

async function BudgetForecastingDashboard() {
  const budgets = await apiFetch(API_ENDPOINTS.BUDGET_FORECASTING.LIST) as any[];
  const summary = {} as any;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Budgets</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${summary.totalBudget?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Actual Spend</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${summary.actualSpend?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Variance</div>
          <div className={`text-2xl font-bold ${(summary.variance || 0) < 0
            ? 'text-red-600 dark:text-red-400'
            : 'text-green-600 dark:text-green-400'
            }`}>
            {(summary.variance || 0) < 0 ? '-' : '+'}${Math.abs(summary.variance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Budget Utilization</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary.utilizationPercent?.toFixed(1) || '0.0'}%
          </div>
        </div>
      </div>

      {/* Matter Budgets Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Matter Budgets
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Forecast</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {budgets.map((budget: any) => {
                const variance = (budget.budget || 0) - (budget.actual || 0);
                const utilizationPercent = budget.budget > 0
                  ? ((budget.actual || 0) / budget.budget * 100)
                  : 0;

                return (
                  <tr key={budget.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                      <Link
                        href={`/cases/${budget.matterId || budget.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {budget.matterName || 'Unknown Matter'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {budget.clientName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ${budget.budget?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ${budget.actual?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600 dark:text-purple-400">
                      ${budget.forecast?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${variance < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                        }`}>
                        {variance < 0 ? '-' : '+'}${Math.abs(variance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ({utilizationPercent.toFixed(1)}% used)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${utilizationPercent >= 100
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : utilizationPercent >= 80
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                        {utilizationPercent >= 100
                          ? 'Over Budget'
                          : utilizationPercent >= 80
                            ? 'At Risk'
                            : 'On Track'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {budgets.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No budget data available
          </div>
        )}
      </div>

      {/* Budget Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Budget Alerts
        </h3>
        <div className="space-y-3">
          {budgets
            .filter((b: any) => b.budget > 0 && (b.actual / b.budget) >= 0.8)
            .map((budget: any) => {
              const utilizationPercent = (budget.actual / budget.budget * 100);
              return (
                <div key={budget.id} className={`p-4 rounded-lg border ${utilizationPercent >= 100
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {budget.matterName} - {utilizationPercent >= 100 ? 'Over Budget' : 'Approaching Limit'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        ${budget.actual.toLocaleString()} of ${budget.budget.toLocaleString()} used ({utilizationPercent.toFixed(1)}%)
                      </div>
                    </div>
                    <Link
                      href={`/cases/${budget.matterId || budget.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Matter
                    </Link>
                  </div>
                </div>
              );
            })}
          {budgets.filter((b: any) => b.budget > 0 && (b.actual / b.budget) >= 0.8).length === 0 && (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              No budget alerts at this time
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default async function BudgetForecastingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Budget Forecasting</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Track matter budgets, analyze variances, and forecast future spend
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export Report
        </button>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <BudgetForecastingDashboard />
      </Suspense>
    </div>
  );
}
