/**
 * WinLossAnalysisCharts Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/analysis
 * @description Conversion trend and source distribution charts
 */

import { ChartColorService, useTheme } from '@/features/theme';
import { Card } from '@/shared/ui/molecules/Card/Card';
import type { ConversionTrend, LeadsBySource } from '@/types/crm';
import { getChartTheme } from '@/utils/chartConfig';
import React from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface WinLossAnalysisChartsProps {
  conversionTrend: ConversionTrend[];
  leadsBySource: LeadsBySource[];
}

export const WinLossAnalysisCharts: React.FC<WinLossAnalysisChartsProps> = ({
  conversionTrend,
  leadsBySource
}) => {
  const { mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as 'light' | 'dark');
  const chartTheme = getChartTheme(mode as 'light' | 'dark');

  return (
    <>
      <Card title="Conversion Trend">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conversionTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <Tooltip contentStyle={chartTheme.tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke={chartColors[0]} strokeWidth={2} name="Total Leads" />
              <Line type="monotone" dataKey="won" stroke={chartColors[2]} strokeWidth={2} name="Won" />
              <Line type="monotone" dataKey="lost" stroke={chartColors[4]} strokeWidth={2} name="Lost" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Leads by Source">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart>
              <Pie
                data={leadsBySource}
                dataKey="count"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(props) => {
                  const payload = props.payload || {};
                  const source = (payload as { source?: string }).source || (props as { source?: string }).source;
                  const count = (payload as { count?: number }).count ?? (props as { count?: number }).count;
                  return source && count !== undefined ? `${source}: ${count}` : '';
                }}
              >
                {leadsBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
};
