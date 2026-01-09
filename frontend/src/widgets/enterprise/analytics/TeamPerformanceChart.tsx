/**
 * @module components/enterprise/analytics/TeamPerformanceChart
 * @category Enterprise Analytics
 * @description Team performance visualization with bar charts.
 *
 * Features:
 * - Horizontal and vertical bar charts
 * - Grouped and stacked bar charts
 * - Responsive container
 * - Theme-aware colors
 * - Interactive tooltips
 * - Legend support
 * - Sortable data
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useChartTheme } from '@/shared/ui/organisms/ChartHelpers/ChartHelpers';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TeamMemberPerformance {
  /** Team member name or identifier */
  name: string;
  /** Total cases handled */
  totalCases?: number;
  /** Active cases */
  activeCases?: number;
  /** Closed cases */
  closedCases?: number;
  /** Won cases */
  wonCases?: number;
  /** Billable hours */
  billableHours?: number;
  /** Revenue generated */
  revenue?: number;
  /** Client satisfaction score (0-100) */
  satisfaction?: number;
  /** Additional metrics */
  [key: string]: string | number | undefined;
}

export interface TeamPerformanceChartProps {
  /** Performance data */
  data: TeamMemberPerformance[];
  /** Metrics to display */
  metrics?: string[];
  /** Chart orientation */
  layout?: 'horizontal' | 'vertical';
  /** Bar chart type */
  type?: 'grouped' | 'stacked';
  /** Chart height in pixels */
  height?: number;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Custom color mapping for metrics */
  colorMap?: Record<string, string>;
  /** Value formatter */
  formatValue?: (value: number, metric: string) => string;
  /** Sort order */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Loading state */
  loading?: boolean;
  /** Click handler for bars */
  onBarClick?: (data: TeamMemberPerformance, metric: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({
  data,
  metrics = ['totalCases', 'billableHours', 'revenue'],
  layout = 'vertical',
  type = 'grouped',
  height = 400,
  showLegend = true,
  showGrid = true,
  colorMap,
  formatValue = (value) => value.toLocaleString(),
  sortBy,
  sortOrder = 'desc',
  loading = false,
  onBarClick
}) => {
  const chartTheme = useChartTheme();

  // Default metric configuration
  const metricConfig: Record<string, { label: string; color: string }> = useMemo(() => ({
    totalCases: {
      label: 'Total Cases',
      color: colorMap?.totalCases || chartTheme.colors.primary
    },
    activeCases: {
      label: 'Active Cases',
      color: colorMap?.activeCases || chartTheme.colors.warning
    },
    closedCases: {
      label: 'Closed Cases',
      color: colorMap?.closedCases || chartTheme.colors.success
    },
    wonCases: {
      label: 'Won Cases',
      color: colorMap?.wonCases || chartTheme.colors.success
    },
    billableHours: {
      label: 'Billable Hours',
      color: colorMap?.billableHours || chartTheme.colors.blue
    },
    revenue: {
      label: 'Revenue',
      color: colorMap?.revenue || chartTheme.colors.emerald
    },
    satisfaction: {
      label: 'Satisfaction',
      color: colorMap?.satisfaction || chartTheme.colors.purple
    }
  }), [chartTheme.colors, colorMap]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortBy] as number || 0;
      const bVal = b[sortBy] as number || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortBy, sortOrder]);

  // Custom tooltip
  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props as { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; color?: string }>; label?: string };
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div style={chartTheme.tooltipStyle}>
        <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
          {label}
        </p>
        {/* IDENTITY-STABLE KEYS: Use dataKey as stable identifier */}
        {payload.map((entry: { dataKey?: string; value?: number; color?: string }) => {
          const metricKey = entry.dataKey as string;
          const metricLabel = metricConfig[metricKey]?.label || metricKey;

          return (
            <div key={metricKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: entry.color
                }}
              />
              <span style={{ fontSize: '13px' }}>
                {metricLabel}: <strong>{formatValue(entry.value || 0, metricKey)}</strong>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Handle bar click
  const handleBarClick = (data: unknown, metric: string) => {
    if (onBarClick) {
      onBarClick(data as TeamMemberPerformance, metric);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: chartTheme.text
        }}
      >
        Loading team performance data...
      </div>
    );
  }

  // Empty state
  if (!sortedData || sortedData.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: chartTheme.text
        }}
      >
        No team performance data available
      </div>
    );
  }

  const margin = layout === 'horizontal'
    ? { top: 20, right: 30, left: 20, bottom: 5 }
    : { top: 20, right: 30, left: 100, bottom: 5 };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sortedData}
        layout={layout}
        margin={margin}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid}
            horizontal={layout === 'horizontal'}
            vertical={layout === 'vertical'}
          />
        )}
        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey="name"
              stroke={chartTheme.text}
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={chartTheme.text}
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue(value, '')}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              stroke={chartTheme.text}
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue(value, '')}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={chartTheme.text}
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
          </>
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: chartTheme.grid, opacity: 0.3 }} />
        {showLegend && (
          <Legend
            wrapperStyle={{ color: chartTheme.text }}
            iconType="rect"
          />
        )}
        {metrics.map((metric) => {
          const config = metricConfig[metric];
          if (!config) return null;

          return (
            <Bar
              key={metric}
              dataKey={metric}
              name={config.label}
              fill={config.color}
              stackId={type === 'stacked' ? 'stack' : undefined}
              radius={type === 'grouped' ? [4, 4, 0, 0] : undefined}
              onClick={(data) => handleBarClick(data, metric)}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TeamPerformanceChart;
