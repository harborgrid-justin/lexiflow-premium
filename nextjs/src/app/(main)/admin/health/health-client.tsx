'use client';

/**
 * Health Client Component
 * Displays system health status and metrics with real-time updates
 */

import { useMemo } from 'react';
import {
  Activity, Server, Database, HardDrive, Cpu, Clock,
  CheckCircle, AlertTriangle, XCircle, Zap, Users, BarChart3
} from 'lucide-react';
import type { HealthStatus, SystemMetrics, HealthCheck } from '../types';

interface HealthClientProps {
  healthStatus: HealthStatus;
  metrics: SystemMetrics;
}

// =============================================================================
// Status Utilities
// =============================================================================

function getOverallStatusColor(status: HealthStatus['status']): string {
  const colors: Record<string, string> = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unhealthy: 'bg-red-500',
  };
  return colors[status] || 'bg-slate-500';
}

function getOverallStatusBg(status: HealthStatus['status']): string {
  const colors: Record<string, string> = {
    healthy: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    degraded: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    unhealthy: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };
  return colors[status] || 'bg-slate-50 dark:bg-slate-900/20';
}

function getCheckStatusIcon(status: HealthCheck['status']): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    pass: <CheckCircle className="h-5 w-5 text-green-500" />,
    warn: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    fail: <XCircle className="h-5 w-5 text-red-500" />,
  };
  return icons[status] || <AlertTriangle className="h-5 w-5 text-slate-400" />;
}

function getCheckStatusBadge(status: HealthCheck['status']): string {
  const badges: Record<string, string> = {
    pass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    fail: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return badges[status] || 'bg-slate-100 text-slate-800';
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getUsageColor(usage: number): string {
  if (usage >= 90) return 'bg-red-500';
  if (usage >= 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

// =============================================================================
// Metric Card Component
// =============================================================================

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  progress?: number;
  subValue?: string;
}

function MetricCard({ icon, label, value, unit, progress, subValue }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-slate-400">{icon}</div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        {unit && <span className="text-sm text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>
      {progress !== undefined && (
        <div className="mt-2">
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getUsageColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {subValue && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subValue}</p>
      )}
    </div>
  );
}

// =============================================================================
// Health Check Row Component
// =============================================================================

interface HealthCheckRowProps {
  check: HealthCheck;
}

function HealthCheckRow({ check }: HealthCheckRowProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      {getCheckStatusIcon(check.status)}
      <div className="flex-1">
        <div className="font-medium text-slate-900 dark:text-white">{check.name}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{check.message}</div>
      </div>
      {check.duration !== undefined && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {check.duration}ms
        </div>
      )}
      <span className={`px-2 py-1 text-xs font-medium rounded ${getCheckStatusBadge(check.status)}`}>
        {check.status.toUpperCase()}
      </span>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function HealthClient({ healthStatus, metrics }: HealthClientProps) {
  const healthStats = useMemo(() => ({
    pass: healthStatus.checks.filter((c) => c.status === 'pass').length,
    warn: healthStatus.checks.filter((c) => c.status === 'warn').length,
    fail: healthStatus.checks.filter((c) => c.status === 'fail').length,
  }), [healthStatus.checks]);

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`rounded-lg shadow p-6 border ${getOverallStatusBg(healthStatus.status)}`}>
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center ${getOverallStatusColor(healthStatus.status)}`}>
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              System {healthStatus.status}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {healthStats.pass} services healthy
              {healthStats.warn > 0 && `, ${healthStats.warn} warnings`}
              {healthStats.fail > 0 && `, ${healthStats.fail} failures`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Cpu className="h-5 w-5" />}
            label="CPU Usage"
            value={metrics.system.cpuUsage}
            unit="%"
            progress={metrics.system.cpuUsage}
            subValue={`Load: ${metrics.system.loadAverage.map(l => l.toFixed(2)).join(', ')}`}
          />
          <MetricCard
            icon={<Server className="h-5 w-5" />}
            label="Memory Usage"
            value={metrics.system.memoryUsage}
            unit="%"
            progress={metrics.system.memoryUsage}
          />
          <MetricCard
            icon={<HardDrive className="h-5 w-5" />}
            label="Disk Usage"
            value={metrics.system.diskUsage}
            unit="%"
            progress={metrics.system.diskUsage}
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Uptime"
            value={formatUptime(metrics.system.uptime)}
          />
        </div>
      </div>

      {/* Application Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Application Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Users className="h-5 w-5" />}
            label="Active Users"
            value={metrics.application.activeUsers}
            subValue={`${metrics.application.totalRequests.toLocaleString()} total requests`}
          />
          <MetricCard
            icon={<Zap className="h-5 w-5" />}
            label="Requests/min"
            value={metrics.application.requestsPerMinute}
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Avg Response"
            value={metrics.application.averageResponseTime}
            unit="ms"
          />
          <MetricCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Error Rate"
            value={metrics.application.errorRate}
            unit="%"
            subValue={metrics.application.errorRate > 1 ? 'Above threshold' : 'Normal'}
          />
        </div>
      </div>

      {/* Database Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Database Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Database className="h-5 w-5" />}
            label="Connections"
            value={`${metrics.database.activeConnections}/${metrics.database.connections}`}
            progress={(metrics.database.activeConnections / metrics.database.poolSize) * 100}
            subValue={`Pool size: ${metrics.database.poolSize}`}
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Avg Query Time"
            value={metrics.database.queryTime}
            unit="ms"
          />
          <MetricCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Cache Hit Rate"
            value={metrics.database.cacheHitRate}
            unit="%"
            progress={metrics.database.cacheHitRate}
          />
          <MetricCard
            icon={<Server className="h-5 w-5" />}
            label="Pool Utilization"
            value={Math.round((metrics.database.activeConnections / metrics.database.poolSize) * 100)}
            unit="%"
            progress={(metrics.database.activeConnections / metrics.database.poolSize) * 100}
          />
        </div>
      </div>

      {/* Health Checks */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Service Health Checks</h3>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {healthStats.pass} Pass
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              {healthStats.warn} Warn
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {healthStats.fail} Fail
            </span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {healthStatus.checks.map((check) => (
            <HealthCheckRow key={check.name} check={check} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Run All Health Checks
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
          >
            View Full Metrics
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
          >
            Configure Alerts
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
          >
            Export Health Report
          </button>
        </div>
      </div>
    </div>
  );
}
