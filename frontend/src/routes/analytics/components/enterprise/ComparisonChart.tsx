/**
 * @module components/enterprise/analytics/ComparisonChart
 * @category Enterprise Analytics
 * @description Comparison visualization for Year-over-Year and Month-over-Month analysis.
 *
 * Features:
 * - YoY and MoM comparisons
 * - Side-by-side bar charts
 * - Percentage change indicators
 * - Growth trend visualization
 * - Responsive container
 * - Theme-aware colors
 * - Interactive tooltips
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ComparisonDataPoint {
  /** Period label (e.g., "Jan", "Q1", "2024") */
  period: string;
  /** Current period value */
  current: number;
  /** Previous period value (last year or last month) */
  previous: number;
  /** Percentage change (calculated if not provided) */
  change?: number;
  /** Target or goal value */
  target?: number;
}

export type ComparisonType = 'yoy' | 'mom' | 'qoq' | 'custom';
export type VisualizationType = 'bar' | 'line' | 'composed';

export interface ComparisonChartProps {
  /** Comparison data */
  data: ComparisonDataPoint[];
  /** Type of comparison */
  comparisonType?: ComparisonType;
  /** Visualization type */
  visualizationType?: 'bar' | 'line' | 'composed';
  /** Chart height in pixels */
  height?: number;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Whether to show percentage change */
  showChange?: boolean;
  /** Whether to show target line */
  showTarget?: boolean;
  /** Custom labels */
  labels?: {
    current?: string;
    previous?: string;
    change?: string;
    target?: string;
  };
  /** Custom colors */
  colors?: {
    current?: string;
    previous?: string;
    positive?: string;
    negative?: string;
    target?: string;
  };
  /** Value formatter */
  formatValue?: (value: number) => string;
  /** Percentage formatter */
  formatPercentage?: (value: number) => string;
  /** Loading state */
  loading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  comparisonType = 'yoy',
  visualizationType = 'bar',
  height = 400,
  showLegend = true,
  showGrid = true,
  showChange = true,
  showTarget = false,
  labels,
  colors,
  formatValue = (value) => value.toLocaleString(),
  formatPercentage = (value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`,
  loading = false
}) => {
  const chartTheme = useChartTheme();

  // Default labels based on comparison type
  const defaultLabels = useMemo(() => {
    const baseLabels = {
      yoy: { current: 'This Year', previous: 'Last Year' },
      mom: { current: 'This Month', previous: 'Last Month' },
      qoq: { current: 'This Quarter', previous: 'Last Quarter' },
      custom: { current: 'Current', previous: 'Previous' }
    };
    return {
      ...baseLabels[comparisonType],
      change: 'Change %',
      target: 'Target'
    };
  }, [comparisonType]);

  const finalLabels = { ...defaultLabels, ...labels };

  // Color configuration
  const colorConfig = useMemo(() => ({
    current: colors?.current || chartTheme.colors.primary,
    previous: colors?.previous || chartTheme.colors.secondary,
    positive: colors?.positive || chartTheme.colors.success,
    negative: colors?.negative || chartTheme.colors.danger,
    target: colors?.target || chartTheme.colors.warning
  }), [chartTheme.colors, colors]);

  // Calculate percentage changes if not provided
  const processedData = useMemo(() =>
    data.map(item => ({
      ...item,
      change: item.change !== undefined
        ? item.change
        : item.previous !== 0
          ? ((item.current - item.previous) / item.previous) * 100
          : 0,
      changeAbs: Math.abs(
        item.change !== undefined
          ? item.change
          : item.previous !== 0
            ? ((item.current - item.previous) / item.previous) * 100
            : 0
      )
    })),
    [data]
  );

  // Custom tooltip
  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props as { active?: boolean; payload?: Array<{ payload: ComparisonDataPoint & { change: number; changeAbs: number } }>; label?: string };
    if (!active || !payload || payload.length === 0 || !payload[0]) return null;

    const data = payload[0].payload as ComparisonDataPoint & { change: number; changeAbs: number };
    const change = data.change || 0;
    const isPositive = change >= 0;

    return (
      <div style={chartTheme.tooltipStyle}>
        <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
          {label}
        </p>
        <div style={{ fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: colorConfig.current
              }}
            />
            <span>
              {finalLabels.current}: <strong>{formatValue(data.current)}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: colorConfig.previous
              }}
            />
            <span>
              {finalLabels.previous}: <strong>{formatValue(data.previous)}</strong>
            </span>
          </div>
          {showChange && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${chartTheme.grid}` }}>
              <span style={{ color: isPositive ? colorConfig.positive : colorConfig.negative }}>
                {finalLabels.change}: <strong>{formatPercentage(change)}</strong>
              </span>
            </div>
          )}
          {showTarget && data.target && (
            <div style={{ marginTop: '4px' }}>
              <span>
                {finalLabels.target}: <strong>{formatValue(data.target)}</strong>
              </span>
            </div>
          )}
        </div>
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
        Loading comparison data...
      </div>
    );
  }

  // Empty state
  if (!processedData || processedData.length === 0) {
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
        No comparison data available
      </div>
    );
  }

  const margin = { top: 20, right: 30, left: 0, bottom: 5 };

  // Bar chart visualization
  if (visualizationType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={processedData} margin={margin}>
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
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: chartTheme.grid, opacity: 0.3 }} />
          {showLegend && (
            <Legend wrapperStyle={{ color: chartTheme.text }} iconType="rect" />
          )}
          {showTarget && (
            <ReferenceLine
              y={processedData[0]?.target}
              stroke={colorConfig.target}
              strokeDasharray="3 3"
              label={finalLabels.target}
            />
          )}
          <Bar
            dataKey="current"
            name={finalLabels.current}
            fill={colorConfig.current}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="previous"
            name={finalLabels.previous}
            fill={colorConfig.previous}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Line chart visualization
  if (visualizationType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={processedData} margin={margin}>
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
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartTheme.grid, strokeWidth: 1 }} />
          {showLegend && (
            <Legend wrapperStyle={{ color: chartTheme.text }} iconType="circle" />
          )}
          {showTarget && (
            <ReferenceLine
              y={processedData[0]?.target}
              stroke={colorConfig.target}
              strokeDasharray="3 3"
              label={finalLabels.target}
            />
          )}
          <Line
            type="monotone"
            dataKey="current"
            name={finalLabels.current}
            stroke={colorConfig.current}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="previous"
            name={finalLabels.previous}
            stroke={colorConfig.previous}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Composed chart (bar + line)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={processedData} margin={margin}>
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
          yAxisId="left"
          stroke={chartTheme.text}
          tick={{ fill: chartTheme.text, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
        />
        {showChange && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={chartTheme.text}
            tick={{ fill: chartTheme.text, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPercentage}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend wrapperStyle={{ color: chartTheme.text }} />
        )}
        <Bar
          yAxisId="left"
          dataKey="current"
          name={finalLabels.current}
          fill={colorConfig.current}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="left"
          dataKey="previous"
          name={finalLabels.previous}
          fill={colorConfig.previous}
          radius={[4, 4, 0, 0]}
        />
        {showChange && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="change"
            name={finalLabels.change}
            stroke={colorConfig.positive}
            strokeWidth={2}
            dot={(props: unknown) => {
              const typedProps = props as { cx: number; cy: number; payload: ComparisonDataPoint & { change: number } };
              const { cx, cy, payload } = typedProps;
              const isPositive = payload.change >= 0;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={isPositive ? colorConfig.positive : colorConfig.negative}
                  stroke="none"
                />
              );
            }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;
