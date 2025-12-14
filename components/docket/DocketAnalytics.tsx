/**
 * @module components/docket/DocketAnalytics
 * @category Docket Management
 * @description Analytics dashboard with filing trends and document breakdowns.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '../../services/queryClient';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Card } from '../common/Card';

// Internal Dependencies - Services & Utils
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { aggregateFilingActivity, aggregateJudgeRulings } from './docketAnalytics.utils';
import { STORES } from '../../services/db';

// Types & Interfaces
import { DocketEntry } from '../../types';

export const DocketAnalytics: React.FC = () => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: entries = [] } = useQuery<DocketEntry[]>(
      [STORES.DOCKET, 'all'],
      DataService.docket.getAll
  );

  // Aggregate Filing Activity
  const filingActivity = useMemo(() => aggregateFilingActivity(entries), [entries]);

  // Aggregate Rulings
  const judgeRulings = useMemo(() => aggregateJudgeRulings(entries), [entries]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Filing Volume & Orders">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filingActivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="filings" name="Filings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Motion Outcomes (Trends)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={judgeRulings}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {judgeRulings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: 'Avg Time to Ruling', value: '14 Days', sub: '-2 days vs District Avg' },
            { label: 'Most Active Case', value: 'Martinez v. TechCorp', sub: `${entries.filter(e => e.caseId === 'C-2024-001').length} Entries YTD` },
            { label: 'Upcoming Hearings', value: entries.filter(e => e.type === 'Hearing').length.toString(), sub: 'Next 30 Days' }
        ].map((stat, i) => (
            <div key={i} className={cn("p-6 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase mb-2", theme.text.tertiary)}>{stat.label}</p>
                <p className={cn("text-2xl font-bold mb-1", theme.text.primary)}>{stat.value}</p>
                <p className={cn("text-xs", theme.text.secondary)}>{stat.sub}</p>
            </div>
        ))}
      </div>
    </div>
  );
};
