/**
 * @module components/enterprise/CRM/ClientAnalytics/ProfitabilityTab
 * @description Profitability analysis tab view
 */

import { Card } from '@/shared/ui/molecules/Card/Card';
import type { ThemeObject } from '@/features/theme';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ProfitabilityCard } from './ProfitabilityCard';
import type { ClientProfitability, ClientSegment } from './types';

interface RevenueTrendData {
  month: string;
  revenue: number;
  profit: number;
}

interface ChartTheme {
  grid: string;
  text: string;
  tooltipStyle: Record<string, unknown>;
  [key: string]: string | number | Record<string, unknown>;
}

interface ProfitabilityTabProps {
  profitabilityData: ClientProfitability[];
  segmentData: ClientSegment[];
  revenueTrendData: RevenueTrendData[];
  theme: ThemeObject;
  chartTheme: ChartTheme;
  chartColors: string[];
}

export function ProfitabilityTab({ profitabilityData, segmentData, revenueTrendData, theme, chartTheme, chartColors }: ProfitabilityTabProps) {
  return (
    <div className="space-y-6">
      <Card title="Revenue & Profit Trend (6 Months)">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <Tooltip contentStyle={chartTheme.tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={chartColors[0]} strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke={chartColors[2]} strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Client Profitability Analysis">
        <div className="space-y-4">
          {profitabilityData.map(client => (
            <ProfitabilityCard key={client.clientId} client={client} theme={theme} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue by Segment">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentData as Array<ClientSegment & { [key: string]: string | number }>}
                  dataKey="revenue"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props: { payload?: ClientSegment; segment?: string; revenue?: number }) => {
                    const entry = props.payload || props;
                    return entry.segment && entry.revenue ? `${entry.segment}: $${(entry.revenue / 1000).toFixed(0)}k` : '';
                  }}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Clients by Segment">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                <XAxis dataKey="segment" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <Tooltip contentStyle={chartTheme.tooltipStyle} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
