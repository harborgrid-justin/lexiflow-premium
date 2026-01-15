/**
 * @module components/enterprise/analytics/TimeSeriesChart
 * @category Enterprise Analytics
 * @description Advanced time series visualization with multiple series support.
 *
 * Features:
 * - Multiple time series visualization
 * - Composite charts (line + area + bar)
 * - Zoom and brush support
 * - Reference lines and areas
 * - Responsive container
 * - Theme-aware colors
 * - Interactive tooltips
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  TooltipProps
} from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TimeSeriesDataPoint {
  /** Timestamp or time label */
  timestamp: string;
  /** Multiple series values */
  [key: string]: string | number | undefined;
}

export interface SeriesConfig {
  /** Series key in data */
  dataKey: string;
  /** Display name */
  name: string;
  /** Chart type for this series */
  type: 'line' | 'area' | 'bar';
  /** Color */
  color: string;
  /** Y-axis ID (left or right) */
  yAxisId?: 'left' | 'right';
  /** Show dots on line */
  showDots?: boolean;
  /** Stack ID for stacked series */
  stackId?: string;
}

export interface ReferenceLine {
  /** Y value for horizontal line, or X value for vertical line */
  value: number | string;
  /** Line orientation */
  orientation: 'horizontal' | 'vertical';
  /** Label */
  label?: string;
  /** Color */
  color?: string;
  /** Stroke style */
  strokeDasharray?: string;
}

export interface ReferenceAreaConfig {
  /** Start value */
  x1?: string | number;
  /** End value */
  x2?: string | number;
  /** Y1 value */
  y1?: number;
  /** Y2 value */
  y2?: number;
  /** Label */
  label?: string;
  /** Fill color */
  fill?: string;
  /** Opacity */
  fillOpacity?: number;
}

export interface TimeSeriesChartProps {
  /** Time series data */
  data: TimeSeriesDataPoint[];
  /** Series configuration */
  series: SeriesConfig[];
  /** Chart height in pixels */
  height?: number;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Whether to show brush for zooming */
  showBrush?: boolean;
  /** Reference lines */
  referenceLines?: ReferenceLine[];
  /** Reference areas */
  referenceAreas?: ReferenceAreaConfig[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Left Y-axis label */
  yAxisLabelLeft?: string;
  /** Right Y-axis label */
  yAxisLabelRight?: string;
  /** Value formatter for left Y-axis */
  formatValueLeft?: (value: number) => string;
  /** Value formatter for right Y-axis */
  formatValueRight?: (value: number) => string;
  /** Date formatter for X-axis */
  formatDate?: (value: string) => string;
  /** Loading state */
  loading?: boolean;
  /** Sync brush with other charts */
  syncId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  series,
  height = 400,
  showLegend = true,
  showGrid = true,
  showBrush = false,
  referenceLines = [],
  referenceAreas = [],
  xAxisLabel,
  yAxisLabelLeft,
  yAxisLabelRight,
  formatValueLeft = (value) => value.toLocaleString(),
  formatValueRight = (value) => value.toLocaleString(),
  formatDate = (value) => value,
  loading = false,
  syncId
}) => {
  const chartTheme = useChartTheme();

  // Check if we need right Y-axis
  const hasRightAxis = useMemo(() =>
    series.some(s => s.yAxisId === 'right'),
    [series]
  );

  // Custom tooltip
  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props as { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>; label?: string };
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div style={chartTheme.tooltipStyle}>
        <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
          {formatDate(label || '')}
        </p>
        {payload.map((entry: { name?: string; value?: number; color?: string; dataKey?: string }, index: number) => {
          const seriesConfig = series.find(s => s.dataKey === entry.dataKey);
          const formatter = seriesConfig?.yAxisId === 'right' ? formatValueRight : formatValueLeft;

          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: entry.color
                }}
              />
              <span style={{ fontSize: '13px' }}>
                {entry.name}: <strong>{formatter(entry.value || 0)}</strong>
              </span>
            </div>
          );
        })}
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
        Loading time series data...
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
        No time series data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: hasRightAxis ? 30 : 10, left: 0, bottom: showBrush ? 20 : 5 }}
        syncId={syncId}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        )}
        <XAxis
          dataKey="timestamp"
          stroke={chartTheme.text}
          tick={{ fill: chartTheme.text, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatDate}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          yAxisId="left"
          stroke={chartTheme.text}
          tick={{ fill: chartTheme.text, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValueLeft}
          label={yAxisLabelLeft ? { value: yAxisLabelLeft, angle: -90, position: 'insideLeft' } : undefined}
        />
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={chartTheme.text}
            tick={{ fill: chartTheme.text, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValueRight}
            label={yAxisLabelRight ? { value: yAxisLabelRight, angle: 90, position: 'insideRight' } : undefined}
          />
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartTheme.grid, strokeWidth: 1 }} />
        {showLegend && (
          <Legend
            wrapperStyle={{ color: chartTheme.text }}
            iconType="circle"
          />
        )}

        {/* Reference Areas */}
        {referenceAreas.map((area, index) => (
          <ReferenceArea
            key={`area-${index}`}
            x1={area.x1}
            x2={area.x2}
            y1={area.y1}
            y2={area.y2}
            fill={area.fill || chartTheme.grid}
            fillOpacity={area.fillOpacity || 0.3}
            label={area.label}
          />
        ))}

        {/* Reference Lines */}
        {referenceLines.map((line, index) => (
          <ReferenceLine
            key={`line-${index}`}
            {...(line.orientation === 'horizontal' ? { y: line.value } : { x: line.value })}
            stroke={line.color || chartTheme.colors.danger}
            strokeDasharray={line.strokeDasharray || '3 3'}
            label={line.label}
          />
        ))}

        {/* Series */}
        {series.map((seriesConfig) => {
          const commonProps = {
            key: seriesConfig.dataKey,
            dataKey: seriesConfig.dataKey,
            name: seriesConfig.name,
            stroke: seriesConfig.color,
            fill: seriesConfig.color,
            yAxisId: seriesConfig.yAxisId || 'left',
            stackId: seriesConfig.stackId
          };

          switch (seriesConfig.type) {
            case 'line':
              return (
                <Line
                  {...commonProps}
                  type="monotone"
                  strokeWidth={2}
                  dot={seriesConfig.showDots ? { r: 3 } : false}
                  activeDot={{ r: 5 }}
                />
              );
            case 'area':
              return (
                <Area
                  {...commonProps}
                  type="monotone"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              );
            case 'bar':
              return (
                <Bar
                  {...commonProps}
                  fillOpacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
              );
            default:
              return null;
          }
        })}

        {/* Brush for zooming */}
        {showBrush && (
          <Brush
            dataKey="timestamp"
            height={30}
            stroke={chartTheme.colors.primary}
            fill={chartTheme.grid}
            tickFormatter={formatDate}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default TimeSeriesChart;
