/**
 * @module components/matters/MatterAnalyticsView
 * @category Matter Management
 * @description Analytics and reporting view for matters
 * @optimization React.memo, useMemo for expensive analytics calculations
 */

import React, { useMemo, useCallback } from 'react';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { Matter } from '../../../types';
import { BarChart3, TrendingUp, DollarSign, Users, Briefcase, AlertCircle, RefreshCw } from 'lucide-react';

export const MatterAnalyticsView: React.FC = React.memo(() => {
  const { data: matters = [], isLoading, isError, refetch } = useQuery<Matter[]>(
    queryKeys.cases.matters.all(),
    () => DataService.matters.getAll(),
    { staleTime: 30000 } // Cache for 30 seconds
  );

  const analytics = useMemo(() => {
    const byStatus = {} as Record<string, number>;
    const byPriority = {} as Record<string, number>;
    const byType = {} as Record<string, number>;
    const byPracticeArea = {} as Record<string, number>;

    matters.forEach(matter => {
      byStatus[matter.status] = (byStatus[matter.status] || 0) + 1;
      byPriority[matter.priority] = (byPriority[matter.priority] || 0) + 1;
      const type = matter.type || matter.matterType || 'Unknown';
      byType[type] = (byType[type] || 0) + 1;
      if (matter.practiceArea) {
        byPracticeArea[matter.practiceArea] = (byPracticeArea[matter.practiceArea] || 0) + 1;
      }
    });

    return { byStatus, byPriority, byType, byPracticeArea };
  }, [matters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalValue = matters.reduce((sum, m) => sum + (m.estimatedValue || 0), 0);
  const avgValue = matters.length > 0 ? totalValue / matters.length : 0;

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Matter Analytics
        </h2>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Matters</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {matters.length}
                </p>
              </div>
              <Briefcase className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Value</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Avg Value</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {formatCurrency(avgValue)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Active Attorneys</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                  {new Set(matters.map(m => m.responsibleAttorneyName)).size}
                </p>
              </div>
              <Users className="w-10 h-10 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* By Status */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Matters by Status
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                    {status.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / matters.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Priority */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Matters by Priority
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.byPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                    {priority}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          priority === 'URGENT' ? 'bg-rose-600' :
                          priority === 'HIGH' ? 'bg-orange-600' :
                          priority === 'MEDIUM' ? 'bg-blue-600' : 'bg-slate-600'
                        }`}
                        style={{ width: `${(count / matters.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Type */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Matters by Type
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${(count / matters.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Practice Area */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Matters by Practice Area
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.byPracticeArea).map(([area, count]) => (
                <div key={area} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                    {area.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${matters.length > 0 ? (count / matters.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

MatterAnalyticsView.displayName = 'MatterAnalyticsView';

MatterAnalyticsView.displayName = 'MatterAnalyticsView';
