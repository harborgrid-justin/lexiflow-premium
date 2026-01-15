/**
 * LeadPipelineChart Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/leads
 * @description Pipeline visualization chart by status
 */

import { ChartColorService, useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/molecules/Card/Card';
import type { LeadsByStatus } from '@/types/crm';
import { getChartTheme } from '@/utils/chartConfig';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import React from "react";

interface LeadPipelineChartProps {
  data: LeadsByStatus[];
}

export const LeadPipelineChart: React.FC<LeadPipelineChartProps> = ({ data }) => {
  const { mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as 'light' | 'dark');
  const chartTheme = getChartTheme(mode as 'light' | 'dark');

  return (
    <Card title="Pipeline by Status">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
            <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
            <Tooltip contentStyle={chartTheme.tooltipStyle} />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill={chartColors[0]} radius={[8, 8, 0, 0]} name="Lead Count" />
            <Bar yAxisId="right" dataKey="value" fill={chartColors[2]} radius={[8, 8, 0, 0]} name="Pipeline Value ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
