/**
 * @module components/enterprise/CRM/BusinessDevelopment/LeadsTab
 * @description Leads tab view component
 */

import { Card } from '@/components/molecules/Card/Card';
import type { ThemeObject } from '@/theme';
import { cn } from '@/lib/cn';
import { Plus, Search } from 'lucide-react';
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
import { LeadCard } from './LeadCard';
import type { Lead } from './types';

interface LeadsByStatusData {
  status: string;
  count: number;
}

interface ChartTheme {
  grid: string;
  text: string;
  tooltipStyle: Record<string, unknown>;
  [key: string]: string | number | Record<string, unknown>;
}

interface LeadsTabProps {
  leads: Lead[];
  leadsByStatus: LeadsByStatusData[];
  onLeadClick: (id: string) => void;
  theme: ThemeObject;
  chartTheme: ChartTheme;
  chartColors: string[];
}

export function LeadsTab({ leads, leadsByStatus, onLeadClick, theme, chartTheme, chartColors }: LeadsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className={cn('flex gap-4 p-4 rounded-lg', theme.surface.default, theme.border.default, 'border')}>
        <div className="flex-1">
          <div className="relative">
            <Search className={cn('absolute left-3 top-2.5 h-5 w-5', theme.text.tertiary)} />
            <input
              type="text"
              placeholder="Search leads..."
              className={cn('w-full pl-10 pr-4 py-2 rounded-md border', theme.surface.default, theme.text.primary, theme.border.default)}
            />
          </div>
        </div>
        <select className={cn('px-4 py-2 rounded-md border', theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Statuses</option>
          <option>New</option>
          <option>Qualified</option>
          <option>Proposal</option>
        </select>
        <select className={cn('px-4 py-2 rounded-md border', theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Sources</option>
          <option>Referral</option>
          <option>Website</option>
          <option>Conference</option>
        </select>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 inline mr-1" />
          Add Lead
        </button>
      </div>

      {/* Leads Pipeline */}
      <Card title="Pipeline by Status">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsByStatus} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

      {/* Leads List */}
      <div className="space-y-3">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} theme={theme} />
        ))}
      </div>
    </div>
  );
}
