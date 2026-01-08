/**
 * @module components/enterprise/CRM/BusinessDevelopment/AnalysisTab
 * @description Win/Loss analysis tab view component
 */

import { Card } from '@/components/ui/molecules/Card/Card';
import type { ThemeObject } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import {
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
import { WinLossCard } from './WinLossCard';
import type { WinLossAnalysis } from './types';
import { formatCurrencyMillions } from './utils';

interface ConversionTrendData {
  month: string;
  leads: number;
  won: number;
  lost: number;
}

interface LeadsBySourceData {
  source: string;
  count: number;
  color: string;
  [key: string]: string | number;
}

interface ChartTheme {
  grid: string;
  text: string;
  tooltipStyle: Record<string, unknown>;
  [key: string]: string | number | Record<string, unknown>;
}

interface AnalysisTabProps {
  winLossData: WinLossAnalysis[];
  conversionTrend: ConversionTrendData[];
  leadsBySource: LeadsBySourceData[];
  pipelineValue: number;
  winRate: string;
  avgSalesCycle: number;
  theme: ThemeObject;
  chartTheme: ChartTheme;
  chartColors: string[];
}

export function AnalysisTab({
  winLossData,
  conversionTrend,
  leadsBySource,
  pipelineValue,
  winRate,
  avgSalesCycle,
  theme,
  chartTheme,
  chartColors
}: AnalysisTabProps) {
  return (
    <div className="space-y-6">
      {/* Win Rate Trend */}
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

      {/* Lead Sources Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Leads by Source">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsBySource}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props) => {
                    const payload = (props as { payload?: LeadsBySourceData }).payload;
                    const source = payload?.source || (props as { source?: string }).source;
                    const count = payload?.count ?? (props as { count?: number }).count;
                    return source && count !== undefined ? `${source}: ${count}` : '';
                  }}
                >
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Key Metrics Summary">
          <div className="space-y-4">
            <div className={cn('p-4 rounded', theme.surface.highlight)}>
              <p className={cn('text-sm', theme.text.tertiary)}>Total Pipeline Value</p>
              <p className={cn('text-2xl font-bold', theme.text.primary)}>
                {formatCurrencyMillions(pipelineValue)}
              </p>
            </div>
            <div className={cn('p-4 rounded', theme.surface.highlight)}>
              <p className={cn('text-sm', theme.text.tertiary)}>Win Rate</p>
              <p className="text-2xl font-bold text-green-600">{winRate}%</p>
            </div>
            <div className={cn('p-4 rounded', theme.surface.highlight)}>
              <p className={cn('text-sm', theme.text.tertiary)}>Avg Sales Cycle</p>
              <p className={cn('text-2xl font-bold', theme.text.primary)}>
                {avgSalesCycle} days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Win/Loss Details */}
      <Card title="Win/Loss Analysis">
        <div className="space-y-4">
          {winLossData.map(analysis => (
            <WinLossCard key={analysis.id} analysis={analysis} theme={theme} />
          ))}
        </div>
      </Card>
    </div>
  );
}
