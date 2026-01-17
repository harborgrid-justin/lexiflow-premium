/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { BarChart3, Clock, DollarSign, TrendingUp } from 'lucide-react';

import { PageHeader } from '@/components/organisms/PageHeader';

import { useAnalytics } from './AnalyticsProvider';

export function AnalyticsView() {
  const { caseMetrics, financialMetrics, performanceMetrics } = useAnalytics();

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Analytics" subtitle="Business intelligence and reporting" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-auto">
        <Section title="Case Analytics" icon={<BarChart3 className="w-5 h-5 text-blue-600" />}>
          <MetricGrid>
            <MetricItem label="Total Cases" value={caseMetrics?.totalCases || 0} />
            <MetricItem label="Win Rate" value={`${caseMetrics?.winRate || 0}%`} />
            <MetricItem label="Avg Duration" value={`${caseMetrics?.avgDuration || 0} days`} />
            <MetricItem label="Settlement Rate" value={`${caseMetrics?.settlementRate || 0}%`} />
          </MetricGrid>
        </Section>

        <Section title="Financial Performance" icon={<DollarSign className="w-5 h-5 text-emerald-600" />}>
          <MetricGrid>
            <MetricItem label="Revenue YTD" value={`$${(financialMetrics?.revenueYTD || 0).toLocaleString()}`} />
            <MetricItem label="Collections" value={`${financialMetrics?.collectionRate || 0}%`} />
            <MetricItem label="Avg Invoice" value={`$${(financialMetrics?.avgInvoice || 0).toLocaleString()}`} />
            <MetricItem label="Outstanding AR" value={`$${(financialMetrics?.outstandingAR || 0).toLocaleString()}`} />
          </MetricGrid>
        </Section>

        <Section title="Attorney Performance" icon={<TrendingUp className="w-5 h-5 text-purple-600" />}>
          <MetricGrid>
            <MetricItem label="Utilization" value={`${performanceMetrics?.utilization || 0}%`} />
            <MetricItem label="Billable Hours" value={performanceMetrics?.billableHours || 0} />
            <MetricItem label="Realization" value={`${performanceMetrics?.realization || 0}%`} />
            <MetricItem label="Active Matters" value={performanceMetrics?.activeMatters || 0} />
          </MetricGrid>
        </Section>

        <Section title="Time Tracking" icon={<Clock className="w-5 h-5 text-amber-600" />}>
          <MetricGrid>
            <MetricItem label="This Week" value={`${performanceMetrics?.hoursThisWeek || 0}h`} />
            <MetricItem label="This Month" value={`${performanceMetrics?.hoursThisMonth || 0}h`} />
            <MetricItem label="Billable %" value={`${performanceMetrics?.billablePercentage || 0}%`} />
            <MetricItem label="Unbilled Value" value={`$${(performanceMetrics?.unbilledValue || 0).toLocaleString()}`} />
          </MetricGrid>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
