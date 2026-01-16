/**
 * @module enterprise/dashboard/TeamProductivityWidget
 * @category Enterprise Dashboard
 * @description Team productivity metrics and performance widget
 */

import { cn } from '@/lib/cn';
import { useTheme } from "@/hooks/useTheme";
import { AnimatePresence, motion } from 'framer-motion';
import { Award, BarChart3, Clock, Target, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  tasksCompleted: number;
  hoursLogged: number;
  efficiency: number;
  casesClosed: number;
}

export interface TeamProductivityData {
  metric: string;
  value: number;
  fullMark: number;
}

export interface TeamProductivityWidgetProps {
  teamMembers: TeamMember[];
  productivityData?: TeamProductivityData[];
  totalTasksCompleted: number;
  totalHoursLogged: number;
  averageEfficiency: number;
  title?: string;
  viewMode?: 'list' | 'chart' | 'radar';
  className?: string;
}

/**
 * TeamProductivityWidget - Team productivity and performance metrics
 * Displays team member performance with multiple visualization options
 */
export const TeamProductivityWidget: React.FC<TeamProductivityWidgetProps> = ({
  teamMembers,
  productivityData,
  totalTasksCompleted,
  totalHoursLogged,
  averageEfficiency,
  title = 'Team Productivity',
  viewMode: initialViewMode = 'list',
  className,
}) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'chart' | 'radar'>(initialViewMode);

  const topPerformers = [...teamMembers]
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 3);

  interface TooltipPayload {
    payload: TeamMember | TeamProductivityData;
    name: string;
    value: number;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length && payload[0]) {
      const data = payload[0].payload;
      const displayName = 'name' in data ? data.name : 'metric' in data ? data.metric : '';

      return (
        <div
          className={cn(
            'p-3 rounded-lg shadow-lg border',
            theme.surface.raised,
            theme.border.default
          )}
        >
          <p className={cn('text-sm font-medium', theme.text.primary)}>
            {displayName}
          </p>
          <p className={cn('text-xs', theme.text.secondary)}>
            {payload[0].name}: {payload[0].value}
            {payload[0].name === 'Efficiency' && '%'}
          </p>
        </div>
      );
    }
    return null;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (efficiency >= 75) return 'text-blue-600 dark:text-blue-400';
    if (efficiency >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getEfficiencyBgColor = (efficiency: number): string => {
    if (efficiency >= 90) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (efficiency >= 75) return 'bg-blue-100 dark:bg-blue-900/30';
    if (efficiency >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-rose-100 dark:bg-rose-900/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className={cn('text-lg font-bold', theme.text.primary)}>{title}</h3>
              <p className={cn('text-sm mt-0.5', theme.text.tertiary)}>
                {teamMembers.length} team members
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'
              )}
              aria-label="List view"
            >
              <Users className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'chart'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'
              )}
              aria-label="Chart view"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            {productivityData && (
              <button
                onClick={() => setViewMode('radar')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'radar'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'
                )}
                aria-label="Radar view"
              >
                <Target className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className={cn('p-3 rounded-lg', theme.surface.raised)}>
            <div className="flex items-center gap-2 mb-1">
              <Target className={cn('h-3 w-3', theme.text.tertiary)} />
              <p className={cn('text-xs font-medium', theme.text.tertiary)}>Tasks</p>
            </div>
            <p className={cn('text-lg font-bold', theme.text.primary)}>
              {totalTasksCompleted}
            </p>
          </div>
          <div className={cn('p-3 rounded-lg', theme.surface.raised)}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className={cn('h-3 w-3', theme.text.tertiary)} />
              <p className={cn('text-xs font-medium', theme.text.tertiary)}>Hours</p>
            </div>
            <p className={cn('text-lg font-bold', theme.text.primary)}>
              {totalHoursLogged.toFixed(1)}
            </p>
          </div>
          <div className={cn('p-3 rounded-lg', theme.surface.raised)}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={cn('h-3 w-3', theme.text.tertiary)} />
              <p className={cn('text-xs font-medium', theme.text.tertiary)}>
                Avg Efficiency
              </p>
            </div>
            <p className={cn('text-lg font-bold', theme.text.primary)}>
              {averageEfficiency.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-lg border hover:border-purple-300 dark:hover:border-purple-700 transition-all',
                    theme.surface.raised,
                    theme.border.default
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                          getEfficiencyBgColor(member.efficiency),
                          getEfficiencyColor(member.efficiency)
                        )}
                      >
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(member.name)
                        )}
                      </div>
                      <div>
                        <p className={cn('font-medium', theme.text.primary)}>
                          {member.name}
                        </p>
                        <p className={cn('text-xs', theme.text.tertiary)}>
                          {member.casesClosed} cases closed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn('text-xs', theme.text.tertiary)}>Tasks</p>
                        <p className={cn('text-sm font-bold', theme.text.primary)}>
                          {member.tasksCompleted}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-xs', theme.text.tertiary)}>Hours</p>
                        <p className={cn('text-sm font-bold', theme.text.primary)}>
                          {member.hoursLogged}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-xs', theme.text.tertiary)}>Efficiency</p>
                        <p
                          className={cn(
                            'text-sm font-bold',
                            getEfficiencyColor(member.efficiency)
                          )}
                        >
                          {member.efficiency}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-border)' }} className="relative h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${member.efficiency}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={cn(
                        'h-full rounded-full',
                        member.efficiency >= 90 && 'bg-emerald-500',
                        member.efficiency >= 75 && member.efficiency < 90 && 'bg-blue-500',
                        member.efficiency >= 60 && member.efficiency < 75 && 'bg-amber-500',
                        member.efficiency < 60 && 'bg-rose-500'
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'chart' && (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-96"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamMembers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="tasksCompleted"
                    fill="#8b5cf6"
                    name="Tasks Completed"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="efficiency"
                    fill="#3b82f6"
                    name="Efficiency"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {viewMode === 'radar' && productivityData && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-96"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={productivityData}>
                  <PolarGrid stroke="#9ca3af" opacity={0.3} />
                  <PolarAngleAxis
                    dataKey="metric"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <PolarRadiusAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Performers */}
        {viewMode === 'list' && topPerformers.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-amber-500" />
              <h4 className={cn('text-sm font-bold', theme.text.primary)}>
                Top Performers
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {topPerformers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'p-3 rounded-lg text-center',
                    index === 0
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800'
                      : theme.surface.raised
                  )}
                >
                  <div className="text-2xl mb-1">
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <p
                    className={cn(
                      'text-xs font-medium truncate',
                      theme.text.primary
                    )}
                  >
                    {member.name}
                  </p>
                  <p className={cn('text-lg font-bold', getEfficiencyColor(member.efficiency))}>
                    {member.efficiency}%
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
