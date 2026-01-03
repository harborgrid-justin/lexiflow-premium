/**
 * @module enterprise/dashboard/AdvancedAnalyticsDashboard
 * @category Enterprise Dashboard
 * @description Advanced analytics dashboard with multiple visualization types
 * Provides comprehensive data visualization and analysis capabilities
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Download,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import type { BaseDashboardProps, ChartDataPoint } from '@/types/dashboard';

interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'scatter' | 'composed';
  title: string;
  data: ChartDataPoint[];
  dataKeys: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
}

export interface AdvancedAnalyticsDashboardProps extends BaseDashboardProps {
  charts: ChartConfig[];
  layout?: 'grid' | 'stacked';
  columns?: 1 | 2 | 3;
  onExport?: (chartId: string) => void;
  onExpand?: (chartId: string) => void;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
];

/**
 * AdvancedAnalyticsDashboard - Multi-chart analytics dashboard
 * Displays various chart types with interactive controls
 */
export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  charts,
  layout = 'grid',
  columns = 2,
  className,
  isLoading = false,
  onRefresh,
  onExport,
  onExpand,
}) => {
  const { theme } = useTheme();
  const [activeChartType, setActiveChartType] = useState<string | null>(null);

  const getGridColumns = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 lg:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 lg:grid-cols-2';
    }
  };

  /**
   * Tooltip payload interface for chart data points
   */
  interface TooltipPayload {
    name: string;
    value: number | string;
    color: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }

  /**
   * Props interface for custom tooltip component
   */
  interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }

  /**
   * Custom tooltip component for chart visualization
   * Displays formatted data on hover
   */
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={cn(
            'p-3 rounded-lg shadow-lg border',
            theme.surface.raised,
            theme.border.default
          )}
        >
          <p className={cn('text-sm font-medium mb-2', theme.text.primary)}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className={theme.text.secondary}>
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = (config: ChartConfig, index: number) => {
    const colors = config.colors || DEFAULT_COLORS;
    const height = config.height || 300;

    const chartComponents = {
      line: (
        <LineChart data={config.data}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />}
          <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <Legend />}
          {config.dataKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      ),
      area: (
        <AreaChart data={config.data}>
          <defs>
            {config.dataKeys.map((key, idx) => (
              <linearGradient key={key} id={`gradient-${index}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />}
          <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <Legend />}
          {config.dataKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              fill={`url(#gradient-${index}-${idx})`}
            />
          ))}
        </AreaChart>
      ),
      bar: (
        <BarChart data={config.data}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />}
          <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <Legend />}
          {config.dataKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[idx % colors.length]}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      ),
      pie: (
        <PieChart>
          <Pie
            data={config.data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {config.data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      ),
      radar: (
        <RadarChart data={config.data}>
          <PolarGrid stroke="#9ca3af" opacity={0.3} />
          <PolarAngleAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <PolarRadiusAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
          {config.dataKeys.map((key, idx) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
              fillOpacity={0.6}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <Legend />}
        </RadarChart>
      ),
      scatter: (
        <ScatterChart>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />}
          <XAxis dataKey="x" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis dataKey="y" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <Legend />}
          {config.dataKeys.map((key, idx) => (
            <Scatter
              key={key}
              name={key}
              data={config.data}
              fill={colors[idx % colors.length]}
            />
          ))}
        </ScatterChart>
      ),
      composed: (
        <ComposedChart data={config.data}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />}
          <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey={config.dataKeys[0]}
            fill={colors[0]}
            stroke={colors[0]}
            fillOpacity={0.3}
          />
          <Bar dataKey={config.dataKeys[1] || config.dataKeys[0]} fill={colors[1]} radius={[8, 8, 0, 0]} />
          <Line
            type="monotone"
            dataKey={config.dataKeys[2] || config.dataKeys[0]}
            stroke={colors[2]}
            strokeWidth={2}
          />
        </ComposedChart>
      ),
    };

    return (
      <motion.div
        key={`${config.type}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          'p-6 rounded-xl border shadow-sm',
          theme.surface.default,
          theme.border.default
        )}
      >
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={cn('text-lg font-bold', theme.text.primary)}>{config.title}</h3>
          <div className="flex items-center gap-2">
            {onExport && (
              <button
                onClick={() => onExport(`${config.type}-${index}`)}
                className={cn(
                  'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
                  theme.text.secondary
                )}
                aria-label="Export chart"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            {onExpand && (
              <button
                onClick={() => onExpand(`${config.type}-${index}`)}
                className={cn(
                  'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
                  theme.text.secondary
                )}
                aria-label="Expand chart"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chart Content */}
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {chartComponents[config.type]}
          </ResponsiveContainer>
        )}
      </motion.div>
    );
  };

  const filteredCharts = useMemo(() => {
    if (!activeChartType) return charts;
    return charts.filter((chart) => chart.type === activeChartType);
  }, [charts, activeChartType]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={cn('text-2xl font-bold', theme.text.primary)}>
            Advanced Analytics
          </h2>
          <p className={cn('text-sm mt-1', theme.text.tertiary)}>
            Comprehensive data visualization and insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveChartType(null)}
            className={cn(
              'px-3 py-2 text-xs font-medium rounded-lg transition-colors',
              !activeChartType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            )}
          >
            All Charts
          </button>
          {[
            { type: 'line', icon: TrendingUp, label: 'Line' },
            { type: 'bar', icon: BarChart3, label: 'Bar' },
            { type: 'pie', icon: PieChartIcon, label: 'Pie' },
            { type: 'radar', icon: Target, label: 'Radar' },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setActiveChartType(type)}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1',
                activeChartType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Refresh analytics"
            >
              <RefreshCw className={cn('h-5 w-5', isLoading && 'animate-spin', theme.text.secondary)} />
            </button>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <AnimatePresence mode="wait">
        <div className={cn('grid gap-6', layout === 'grid' ? getGridColumns() : 'grid-cols-1')}>
          {filteredCharts.map((chart, index) => renderChart(chart, index))}
        </div>
      </AnimatePresence>

      {filteredCharts.length === 0 && (
        <div className="text-center py-12">
          <Activity className={cn('h-12 w-12 mx-auto mb-3', theme.text.tertiary)} />
          <p className={cn('text-sm font-medium', theme.text.secondary)}>
            No charts match the selected filter
          </p>
        </div>
      )}
    </div>
  );
};
