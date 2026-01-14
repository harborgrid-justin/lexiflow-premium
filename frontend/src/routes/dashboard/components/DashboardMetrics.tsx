/**

* @module components/dashboard/DashboardMetrics
 * @category Dashboard
 * @description Live-updating metrics cards displaying key firm statistics with
 * real-time simulation and trend indicators.
 *
 * THEME SYSTEM USAGE:
 * This component delegates to MetricCard which uses the theme system.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, Briefcase, Clock, FileText } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks

// Components
import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DashboardMetricsProps {
  /** Statistics object with key firm metrics. */
  stats: {
    activeCases: number;
    pendingMotions: number;
    billableHours: number;
    highRisks: number;
  } | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  const metrics = [
    {
      label: "Active Cases",
      value: stats?.activeCases ?? 0,
      icon: Briefcase,
      color: "border-l-blue-600",
      isLive: true,
    },
    {
      label: "Pending Motions",
      value: stats?.pendingMotions ?? 0,
      icon: FileText,
      color: "border-l-indigo-600",
      isLive: true,
    },
    {
      label: "Billable Hours (Mo)",
      value: stats?.billableHours ?? 0,
      icon: Clock,
      color: "border-l-emerald-600",
      isLive: true,
    },
    {
      label: "High Risk Items",
      value: stats?.highRisks ?? 0,
      icon: AlertTriangle,
      color: "border-l-rose-600",
      isLive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((stat, idx) => (
        <MetricCard
          key={idx}
          label={stat.label}
          value={stat.value} // Passed as number for animation
          icon={stat.icon}
          trend={undefined}
          trendUp={undefined}
          className={`border-l-4 ${stat.color}`}
          isLive={stat.isLive}
        />
      ))}
    </div>
  );
}
