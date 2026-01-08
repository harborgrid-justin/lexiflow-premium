/**
 * Research Stats Component
 * Displays research statistics cards
 *
 * @module research/_components/ResearchStats
 */

import {
  FolderOpen,
  Search,
  Bookmark,
  Bell,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { ResearchStatistics } from '@/types/research';

interface ResearchStatsProps {
  statistics?: ResearchStatistics | null;
}

export function ResearchStats({ statistics }: ResearchStatsProps) {
  const stats = statistics || {
    totalProjects: 0,
    activeProjects: 0,
    totalSessions: 0,
    sessionsThisWeek: 0,
    totalBookmarks: 0,
    totalSavedSearches: 0,
    totalHours: 0,
    topTopics: [],
    topSources: [],
    recentActivityCount: 0,
  };

  const statCards = [
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: FolderOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Sessions This Week',
      value: stats.sessionsThisWeek,
      total: stats.totalSessions,
      icon: Search,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Bookmarks',
      value: stats.totalBookmarks,
      icon: Bookmark,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Saved Searches',
      value: stats.totalSavedSearches,
      icon: Bell,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </span>
                  {stat.total !== undefined && stat.total > stat.value && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      / {stat.total}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            {stat.total !== undefined && stat.total > 0 && (
              <div className="mt-3">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.bgColor.replace('100', '500').replace('900/30', '500')} rounded-full transition-all duration-500`}
                    style={{
                      width: `${Math.min((stat.value / stat.total) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
