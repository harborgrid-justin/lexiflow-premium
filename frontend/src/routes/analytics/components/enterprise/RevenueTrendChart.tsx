/**
 * @module components/enterprise/analytics/RevenueTrendChart
 * @category Enterprise Analytics
 * @description Revenue trend visualization with area and line charts for enterprise analytics.
 *
 * Features:
 * - Area and line chart visualization
 * - Responsive container
 * - Theme-aware colors
 * - Interactive tooltips
 * - Legend support
 * - Multiple revenue streams
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
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

export interface RevenueDataPoint {
  /** Time period label (e.g., "Jan 2024", "Q1 2024") */
  period: string;
  /** Total revenue for the period */
  revenue: number;
  /** Revenue from billable hours */
  billableRevenue?: number;
  /** Revenue from flat fees */
  flatFeeRevenue?: number;
  /** Revenue from contingency cases */
  contingencyRevenue?: number;
  /** Projected revenue */
  projected?: number;
}

export interface RevenueTrendChartProps {
  /** Revenue data points */
  data: RevenueDataPoint[];
  /** Chart type: area or line */
  type?: 'area' | 'line';
  /** Chart height in pixels */
  height?: number;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Revenue streams to display */
  streams?: ('revenue' | 'billableRevenue' | 'flatFeeRevenue' | 'contingencyRevenue' | 'projected')[];
  /** Custom color mapping */
  colorMap?: Record<string, string>;
  /** Currency formatter */
  formatCurrency?: (value: number) => string;
  /** Loading state */
  loading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  type = 'area',
  height = 400,
  showLegend = true,
  showGrid = true,
  streams = ['revenue'],
  colorMap,
  formatCurrency = (value) => `$${(value / 1000).toFixed(0)}K`,
  loading = false
}) => {
  const chartTheme = useChartTheme();

  // Stream configuration
  const streamConfig = useMemo(() => ({
    revenue: {
      label: 'Total Revenue',
      color: colorMap?.revenue || chartTheme.colors.primary,
      dataKey: 'revenue'
    },
    billableRevenue: {
      label: 'Billable Hours',
      color: colorMap?.billableRevenue || chartTheme.colors.success,
      dataKey: 'billableRevenue'
    },
    flatFeeRevenue: {
      label: 'Flat Fees',
      color: colorMap?.flatFeeRevenue || chartTheme.colors.secondary,
      dataKey: 'flatFeeRevenue'
    },
    contingencyRevenue: {
      label: 'Contingency',
      color: colorMap?.contingencyRevenue || chartTheme.colors.warning,
      dataKey: 'contingencyRevenue'
    },
    projected: {
      label: 'Projected',
      color: colorMap?.projected || chartTheme.colors.neutral,
      dataKey: 'projected'
    }
  }), [chartTheme.colors, colorMap]);

  // Custom tooltip
  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props as { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>; label?: string };
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div style={chartTheme.tooltipStyle}>
        <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
          {label}
        </p>
        {/* IDENTITY-STABLE KEYS: Use dataKey or name */}
        {payload.map((entry: { name?: string; value?: number; color?: string; dataKey?: string }) => (
          <div key={entry.dataKey || entry.name || `entry-${entry.value}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: entry.color
              }}
            />
            <span style={{ fontSize: '13px' }}>
              {entry.name}: <strong>{formatCurrency(entry.value || 0)}</strong>
            </span>
          </div>
        ))}
      </div>
    );
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
        Loading revenue data...
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
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
        No revenue data available
      </div>
    );
  }

  const commonProps = {
    data,
    margin: { top: 10, right: 30, left: 0, bottom: 0 }
  };

  const chartContent = (
    <>
      {showGrid && (
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
      )}
      <XAxis
        dataKey="period"
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
        tickFormatter={formatCurrency}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: chartTheme.grid }} />
      {showLegend && (
        <Legend
          wrapperStyle={{ color: chartTheme.text }}
          iconType="circle"
        />
      )}
      {streams.map((streamKey) => {
        const config = streamConfig[streamKey];
        if (!config) return null;

        if (type === 'area') {
          return (
            <Area
              key={streamKey}
              type="monotone"
              dataKey={config.dataKey}
              name={config.label}
              stroke={config.color}
              fill={config.color}
              fillOpacity={0.6}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          );
        } else {
          return (
            <Line
              key={streamKey}
              type="monotone"
              dataKey={config.dataKey}
              name={config.label}
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          );
        }
      })}
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'area' ? (
        <AreaChart {...commonProps}>
          {chartContent}
        </AreaChart>
      ) : (
        <LineChart {...commonProps}>
          {chartContent}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default RevenueTrendChart;
