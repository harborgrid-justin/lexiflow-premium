/**
 * @module EvidenceDashboard
 * @category Evidence
 * @description Dashboard view for the Evidence Vault.
 * Displays high-level metrics, charts, and recent activity for evidence items.
 */

import React from 'react';
import { Activity, AlertTriangle, Box, HardDrive, ShieldCheck } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Common Components
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card';
import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';

// Context & Utils
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';

// Services & Types
import { ViewMode } from '@/hooks/useEvidenceManager';
import { EvidenceItem } from '@/types';

interface EvidenceDashboardProps {
  onNavigate: (view: ViewMode) => void;
  items?: EvidenceItem[];
}

export const EvidenceDashboard: React.FC<EvidenceDashboardProps> = ({ onNavigate, items = [] }) => {
  const { theme, mode } = useTheme();

  // Use items passed from parent (EvidenceVault) which handles fetching and caching
  const evidence = items;

  // Calculate stats from live data
  const stats = React.useMemo(() => ({
    total: evidence.length,
    digital: evidence.filter((e) => e.type === 'Digital').length,
    physical: evidence.filter((e) => e.type === 'Physical').length,
    challenged: evidence.filter((e) => e.admissibility === 'Challenged').length
  }), [evidence]);

  // Calculate recent events from live data
  const recentEvents = React.useMemo(() => {
    return evidence.flatMap((e) =>
      e.chainOfCustody.map((c) => ({ ...c, itemTitle: e.title, itemId: e.id }))
    ).sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [evidence]);

  const chartData = [
    { name: 'Physical', value: stats.physical, color: theme.chart.colors.warning },
    { name: 'Digital', value: stats.digital, color: theme.chart.colors.primary },
    { name: 'Document', value: stats.total - stats.digital - stats.physical, color: theme.chart.colors.neutral },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Evidence"
          value={stats.total}
          icon={Box}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard
          label="Digital Assets"
          value={stats.digital}
          icon={HardDrive}
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard
          label="Admissibility Risk"
          value={stats.challenged}
          icon={AlertTriangle}
          className="border-l-4 border-l-amber-500"
        />
        <MetricCard
          label="Chain Integrity"
          value={100}
          icon={ShieldCheck}
          className="border-l-4 border-l-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card title="Evidence Type Distribution">
          <ResponsiveContainer width="100%" height={256}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Custody Transfers">
          <div className="space-y-4">
            {recentEvents.map((evt: { id?: string; action: string; itemTitle: string; actor: string; date: string }, idx: number) => (
              <div key={idx} className={cn("flex items-start pb-3 border-b last:border-0 last:pb-0", theme.border.default)}>
                <div className={cn("p-2 rounded-full mr-3 shrink-0", theme.primary.light)}>
                  <Activity className={cn("h-4 w-4", theme.primary.text)} />
                </div>
                <div>
                  <p className={cn("text-sm font-medium", theme.text.primary)}>{evt.action}</p>
                  <p className={cn("text-xs", theme.text.secondary)}>
                    <span className={cn("font-semibold", theme.text.primary)}>{evt.itemTitle}</span> • {evt.actor}
                  </p>
                  <p className={cn("text-[10px] mt-0.5", theme.text.tertiary)}>{evt.date}</p>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="ghost" size="sm" className={cn("w-full", theme.primary.text)} onClick={() => onNavigate('custody')}>
                View Full Chain of Custody Log
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Storage Status */}
      <div className={cn("rounded-lg p-6 flex flex-col md:flex-row justify-between items-center shadow-lg", mode === 'dark' ? 'bg-slate-800' : 'bg-slate-900 text-white')}>
        <div>
          <h3 className="font-bold text-lg mb-1">Secure Evidence Storage</h3>
          <p className="opacity-80 text-sm">All digital assets are encrypted at rest (AES-256) and anchored to the Ethereum blockchain.</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="text-center">
            <p className="text-xs opacity-60 uppercase">Storage Used</p>
            <p className="text-xl font-mono font-bold text-emerald-400">4.2 TB</p>
          </div>
          <div className="text-center">
            <p className="text-xs opacity-60 uppercase">Retention Policy</p>
            <p className="text-xl font-mono font-bold text-blue-400">7 Years</p>
          </div>
        </div>
      </div>
    </div>
  );
};
