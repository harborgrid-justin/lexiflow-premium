'use client';

/**
 * Discovery Statistics Component
 * Displays key metrics for the discovery dashboard
 */

import { StatCard } from '@/components/ui';
import {
  FileText,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Shield,
  Clock,
  Users,
  Package,
} from 'lucide-react';
import type { DiscoveryStatistics } from '../_types';

interface DiscoveryStatsProps {
  statistics: DiscoveryStatistics;
}

export function DiscoveryStats({ statistics }: DiscoveryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Requests Overview */}
      <StatCard
        title="Discovery Requests"
        value={statistics.requests.total}
        icon={<FileText className="h-5 w-5" />}
        description={`${statistics.requests.pending} pending, ${statistics.requests.overdue} overdue`}
        trend={statistics.requests.overdue > 0 ? 'down' : 'neutral'}
        trendValue={statistics.requests.overdue > 0 ? `${statistics.requests.overdue} overdue` : 'On track'}
      />

      {/* Review Progress */}
      <StatCard
        title="Documents Reviewed"
        value={`${Math.round((statistics.review.reviewed / statistics.review.totalDocuments) * 100)}%`}
        icon={<CheckCircle className="h-5 w-5" />}
        description={`${statistics.review.reviewed.toLocaleString()} of ${statistics.review.totalDocuments.toLocaleString()}`}
        trend="up"
        trendValue={`${statistics.review.averageReviewRate}/hr`}
      />

      {/* Legal Holds */}
      <StatCard
        title="Active Legal Holds"
        value={statistics.legalHolds.active}
        icon={<Shield className="h-5 w-5" />}
        description={`${statistics.legalHolds.totalCustodians} custodians`}
        trend={statistics.legalHolds.pendingAcknowledgments > 0 ? 'down' : 'neutral'}
        trendValue={`${statistics.legalHolds.pendingAcknowledgments} pending ack.`}
      />

      {/* Productions */}
      <StatCard
        title="Productions"
        value={statistics.productions.total}
        icon={<Package className="h-5 w-5" />}
        description={`${statistics.productions.produced} produced, ${statistics.productions.staging} staging`}
        trend="neutral"
        trendValue={statistics.productions.totalSize}
      />
    </div>
  );
}

/**
 * Detailed statistics cards for expanded view
 */
export function DiscoveryStatsDetailed({ statistics }: DiscoveryStatsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Request Status Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Request Status
        </h3>
        <div className="space-y-3">
          <StatusRow label="Pending" value={statistics.requests.pending} color="amber" />
          <StatusRow label="Served" value={statistics.requests.served} color="blue" />
          <StatusRow label="Responded" value={statistics.requests.responded} color="green" />
          <StatusRow label="Overdue" value={statistics.requests.overdue} color="red" />
        </div>
      </div>

      {/* Review Metrics */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          Review Metrics
        </h3>
        <div className="space-y-3">
          <StatusRow
            label="Not Reviewed"
            value={statistics.review.notReviewed}
            total={statistics.review.totalDocuments}
            color="slate"
          />
          <StatusRow
            label="Responsive"
            value={statistics.review.responsive}
            total={statistics.review.totalDocuments}
            color="green"
          />
          <StatusRow
            label="Privileged"
            value={statistics.review.privileged}
            total={statistics.review.totalDocuments}
            color="purple"
          />
          <StatusRow
            label="Flagged"
            value={statistics.review.flagged}
            total={statistics.review.totalDocuments}
            color="amber"
          />
        </div>
      </div>

      {/* Collection Status */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Collections
        </h3>
        <div className="space-y-3">
          <StatusRow label="Active" value={statistics.collections.active} color="blue" />
          <StatusRow label="Completed" value={statistics.collections.completed} color="green" />
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Total Size</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {statistics.collections.totalSize}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusRowProps {
  label: string;
  value: number;
  total?: number;
  color: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

function StatusRow({ label, value, total, color }: StatusRowProps) {
  const colorClasses = {
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  const percentage = total ? Math.round((value / total) * 100) : null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-900 dark:text-white">
          {value.toLocaleString()}
          {percentage !== null && (
            <span className="text-slate-500 ml-1">({percentage}%)</span>
          )}
        </span>
      </div>
      {total && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className={`${colorClasses[color]} h-1.5 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Quick action alerts for the dashboard
 */
export function DiscoveryAlerts({ statistics }: DiscoveryStatsProps) {
  const alerts = [];

  if (statistics.requests.overdue > 0) {
    alerts.push({
      type: 'error' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      message: `${statistics.requests.overdue} discovery requests are overdue`,
      action: 'View Overdue',
    });
  }

  if (statistics.legalHolds.pendingAcknowledgments > 0) {
    alerts.push({
      type: 'warning' as const,
      icon: <Users className="h-4 w-4" />,
      message: `${statistics.legalHolds.pendingAcknowledgments} custodians have not acknowledged legal hold`,
      action: 'Send Reminders',
    });
  }

  if (statistics.review.notReviewed > 10000) {
    alerts.push({
      type: 'info' as const,
      icon: <FolderOpen className="h-4 w-4" />,
      message: `${statistics.review.notReviewed.toLocaleString()} documents pending review`,
      action: 'Start Review',
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`
            flex items-center justify-between p-4 rounded-lg border
            ${alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
            ${alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : ''}
            ${alert.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            <span className={`
              ${alert.type === 'error' ? 'text-red-600 dark:text-red-400' : ''}
              ${alert.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : ''}
              ${alert.type === 'info' ? 'text-blue-600 dark:text-blue-400' : ''}
            `}>
              {alert.icon}
            </span>
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {alert.message}
            </span>
          </div>
          <button className={`
            text-sm font-medium px-3 py-1 rounded
            ${alert.type === 'error' ? 'text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40' : ''}
            ${alert.type === 'warning' ? 'text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40' : ''}
            ${alert.type === 'info' ? 'text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40' : ''}
          `}>
            {alert.action}
          </button>
        </div>
      ))}
    </div>
  );
}
