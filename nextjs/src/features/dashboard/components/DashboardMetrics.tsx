'use client';

import { TrendingUp, TrendingDown, Briefcase, FileText, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickStat } from '@/lib/dal/dashboard';

interface DashboardMetricsProps {
  stats: QuickStat[];
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        // Map label/icon dynamically or fallback
        let Icon = Briefcase;
        let colorClass = "bg-blue-500";

        if (stat.label.includes('Motion')) { Icon = FileText; colorClass = "bg-indigo-500"; }
        if (stat.label.includes('Hours')) { Icon = Clock; colorClass = "bg-emerald-500"; }
        if (stat.label.includes('Risk')) { Icon = AlertTriangle; colorClass = "bg-rose-500"; }

        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
          >
            <div className="flex items-center">
              <div className={cn("rounded-lg p-3", colorClass)}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </dt>
                  <dd>
                    <div className="flex items-baseline text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center text-sm">
                {stat.change !== undefined && (
                  <span
                    className={cn(
                      "flex items-center font-medium",
                      stat.trend === 'up' ? "text-green-600 dark:text-green-400" :
                        stat.trend === 'down' ? "text-red-600 dark:text-red-400" : "text-slate-500"
                    )}
                  >
                    {stat.trend === 'up' && <TrendingUp className="mr-1 h-4 w-4 shrink-0" />}
                    {stat.trend === 'down' && <TrendingDown className="mr-1 h-4 w-4 shrink-0" />}
                    {Math.abs(stat.change)}%
                  </span>
                )}
                <span className="ml-2 text-slate-500 dark:text-slate-400">from last month</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
