/**
 * @module components/enterprise/CRM/ClientAnalytics/SatisfactionCard
 * @description Client satisfaction metrics card component
 */

import type { ThemeObject } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer
} from 'recharts';
import type { ClientSatisfaction } from './types';

interface ChartTheme {
  grid: string;
  text: string;
  tooltipStyle: Record<string, unknown>;
}

interface SatisfactionCardProps {
  client: ClientSatisfaction;
  theme: ThemeObject;
  chartColors: string[];
  chartTheme: ChartTheme;
}

export function SatisfactionCard({ client, theme, chartColors, chartTheme }: SatisfactionCardProps) {
  const radarData = [
    { metric: 'Responsiveness', value: client.responsiveness },
    { metric: 'Quality', value: client.quality },
    { metric: 'Value', value: client.value },
    { metric: 'Likelihood', value: client.likelihood }
  ];

  const getNPSColor = (nps: number) => {
    if (nps >= 70) return 'text-green-600';
    if (nps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCSATColor = (csat: number) => {
    if (csat >= 80) return 'text-green-600';
    if (csat >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('p-6 rounded-lg border', theme.border.default)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className={cn('font-bold text-lg', theme.text.primary)}>{client.clientName}</h4>
          <p className={cn('text-sm', theme.text.secondary)}>
            Last survey: {client.lastSurveyDate} ({client.totalSurveys} total surveys)
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className={cn('text-xs', theme.text.tertiary)}>NPS</p>
            <p className={cn('text-2xl font-bold', getNPSColor(client.nps))}>
              {client.nps}
            </p>
          </div>
          <div className="text-center">
            <p className={cn('text-xs', theme.text.tertiary)}>CSAT</p>
            <p className={cn('text-2xl font-bold', getCSATColor(client.csat))}>
              {client.csat}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <div className="space-y-3">
          {[
            { label: 'Responsiveness', value: client.responsiveness, color: 'bg-blue-600' },
            { label: 'Quality', value: client.quality, color: 'bg-green-600' },
            { label: 'Value', value: client.value, color: 'bg-purple-600' },
            { label: 'Likelihood to Recommend', value: client.likelihood, color: 'bg-amber-600' }
          ].map(metric => (
            <div key={metric.label}>
              <div className="flex justify-between items-center mb-1">
                <span className={cn('text-sm', theme.text.secondary)}>{metric.label}</span>
                <span className={cn('text-sm font-bold', theme.text.primary)}>
                  {metric.value}/10
                </span>
              </div>
              <div className="h-2 rounded bg-gray-200 dark:bg-gray-700">
                <div
                  className={cn('h-full rounded transition-all', metric.color)}
                  style={{ width: `${metric.value * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke={chartTheme.grid} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: chartTheme.text, fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fill: chartTheme.text, fontSize: 10 }} />
              <Radar
                name={client.clientName}
                dataKey="value"
                stroke={chartColors[0]}
                fill={chartColors[0]}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
