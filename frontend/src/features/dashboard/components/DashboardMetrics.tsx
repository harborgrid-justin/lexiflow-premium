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
import React, { useState } from 'react';
import { Briefcase, Clock, FileText, AlertTriangle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useInterval } from '@/hooks/useInterval';

// Components
import { MetricCard } from '../components/atoms';

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

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ stats }) => {
  // Use state to allow local simulation of "Live" updates
  const [liveStats, setLiveStats] = useState(stats || { activeCases: 0, pendingMotions: 0, billableHours: 0, highRisks: 0 });

  // Simulate real-time updates for demo purposes (DOM Hydration effect)
  useInterval(() => {
      // 30% chance to update every 3 seconds
      if (Math.random() > 0.7) {
          setLiveStats(prev => ({
              ...prev,
              billableHours: prev.billableHours + (Math.random() > 0.5 ? 0.5 : 0),
              pendingMotions: prev.pendingMotions + (Math.random() > 0.8 ? 1 : 0),
              // Rarely change active cases
              activeCases: prev.activeCases + (Math.random() > 0.95 ? 1 : 0)
          }));
      }
  }, 3000);

  const metrics = [
    { label: 'Active Cases', value: liveStats.activeCases, icon: Briefcase, color: 'border-l-blue-600', trend: '+2 New', isLive: true },
    { label: 'Pending Motions', value: liveStats.pendingMotions, icon: FileText, color: 'border-l-indigo-600', isLive: true },
    { label: 'Billable Hours (Mo)', value: liveStats.billableHours, icon: Clock, color: 'border-l-emerald-600', trend: '+5% MoM', isLive: true },
    { label: 'High Risk Items', value: liveStats.highRisks, icon: AlertTriangle, color: 'border-l-rose-600', isLive: false },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((stat, idx) => (
        <MetricCard 
          key={idx} 
          label={stat.label} 
          value={stat.value} // Passed as number for animation
          icon={stat.icon} 
          trend={stat.trend}
          trendUp={true}
          className={`border-l-4 ${stat.color}`}
          isLive={stat.isLive}
        />
      ))}
    </div>
  );
};
