import React from 'react';
import { MetricCard } from '../common/Primitives';
import { Briefcase, Clock, FileText, AlertTriangle } from 'lucide-react';

interface DashboardMetricsProps {
    stats: {
        activeCases: number;
        pendingMotions: number;
        billableHours: number;
        highRisks: number;
    } | null;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ stats }) => {
  // Fallback if stats fail to load for some reason, though parent handles loading state
  const safeStats = stats || { activeCases: 0, pendingMotions: 0, billableHours: 0, highRisks: 0 };

  const metrics = [
    { label: 'Active Cases', value: safeStats.activeCases, icon: Briefcase, color: 'border-l-blue-600', trend: '+2 New' },
    { label: 'Pending Motions', value: safeStats.pendingMotions, icon: FileText, color: 'border-l-indigo-600' },
    { label: 'Billable Hours (Mo)', value: safeStats.billableHours.toLocaleString(), icon: Clock, color: 'border-l-emerald-600', trend: '+5% MoM' },
    { label: 'High Risk Items', value: safeStats.highRisks, icon: AlertTriangle, color: 'border-l-rose-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((stat, idx) => (
        <MetricCard 
          key={idx} 
          label={stat.label} 
          value={stat.value} 
          icon={stat.icon} 
          trend={stat.trend}
          trendUp={true}
          className={`border-l-4 ${stat.color}`}
        />
      ))}
    </div>
  );
};