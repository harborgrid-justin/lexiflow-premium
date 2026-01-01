/**
 * @module components/enterprise/analytics/CaseDistributionChart
 * @category Enterprise Analytics
 * @description Case distribution visualization with pie and donut charts.
 *
 * Features:
 * - Pie and donut chart visualization
 * - Responsive container
 * - Theme-aware colors
 * - Interactive tooltips
 * - Legend support
 * - Percentage calculations
 * - Click handlers for drill-down
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps
} from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CaseDistributionData {
  /** Category name */
  name: string;
  /** Number of cases */
  value: number;
  /** Custom color for this category */
  color?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface CaseDistributionChartProps {
  /** Distribution data */
  data: CaseDistributionData[];
  /** Chart type: pie or donut */
  type?: 'pie' | 'donut';
  /** Chart height in pixels */
  height?: number;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show labels on slices */
  showLabels?: boolean;
  /** Whether to show percentages */
  showPercentages?: boolean;
  /** Custom color palette */
  colors?: string[];
  /** Click handler for slices */
  onSliceClick?: (data: CaseDistributionData) => void;
  /** Loading state */
  loading?: boolean;
  /** Inner radius for donut chart (0-100) */
  innerRadius?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CaseDistributionChart: React.FC<CaseDistributionChartProps> = ({
  data,
  type = 'pie',
  height = 400,
  showLegend = true,
  showLabels = true,
  showPercentages = true,
  colors,
  onSliceClick,
  loading = false,
  innerRadius = 60
}) => {
  const chartTheme = useChartTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Default color palette
  const defaultColors = useMemo(() => [
    chartTheme.colors.primary,
    chartTheme.colors.success,
    chartTheme.colors.warning,
    chartTheme.colors.danger,
    chartTheme.colors.secondary,
    chartTheme.colors.neutral,
    chartTheme.colors.blue,
    chartTheme.colors.purple,
    chartTheme.colors.emerald
  ], [chartTheme.colors]);

  const colorPalette = colors || defaultColors;

  // Calculate total and percentages
  const total = useMemo(() =>
    data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  const dataWithPercentages = useMemo(() =>
    data.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    })),
    [data, total]
  );

  // Custom label
  const renderLabel = (entry: unknown) => {
    if (!showLabels) return null;

    const typedEntry = entry as { percent: number; name: string };
    const percent = typedEntry.percent * 100;
    if (percent < 5) return null;

    if (showPercentages) {
      return `${typedEntry.name} (${percent.toFixed(0)}%)`;
    }
    return typedEntry.name;
  };

  // Custom tooltip
  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload } = props as { active?: boolean; payload?: Array<{ payload: CaseDistributionData & { percentage: number } }> };
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload as CaseDistributionData & { percentage: number };
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div style={chartTheme.tooltipStyle}>
        <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
          {data.name}
        </p>
        <div style={{ fontSize: '13px' }}>
          <div style={{ marginBottom: '4px' }}>
            Cases: <strong>{data.value.toLocaleString()}</strong>
          </div>
          <div>
            Percentage: <strong>{percentage}%</strong>
          </div>
        </div>
      </div>
    );
  };

  // Handle slice enter
  const handleMouseEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  // Handle slice leave
  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Handle slice click
  const handleClick = (entry: unknown) => {
    if (onSliceClick) {
      onSliceClick(entry as CaseDistributionData);
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
        Loading case distribution data...
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
        No case distribution data available
      </div>
    );
  }

  const pieInnerRadius = type === 'donut' ? `${innerRadius}%` : 0;
  const pieOuterRadius = '80%';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithPercentages}
          cx="50%"
          cy="50%"
          labelLine={showLabels}
          label={renderLabel}
          outerRadius={pieOuterRadius}
          innerRadius={pieInnerRadius}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
        >
          {dataWithPercentages.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colorPalette[index % colorPalette.length]}
              opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
              strokeWidth={activeIndex === index ? 2 : 0}
              stroke={chartTheme.text}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: chartTheme.text }}
            iconType="circle"
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CaseDistributionChart;
