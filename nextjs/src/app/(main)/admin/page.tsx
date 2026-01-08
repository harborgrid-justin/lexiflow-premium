/**
 * Admin Dashboard Page
 * Next.js 16 Server Component with metrics, system health, and audit logs
 *
 * Features:
 * - System metrics visualization (4 metric cards)
 * - Health status bars
 * - Recent audit logs
 * - Quick action links
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  Database,
  HardDrive,
  Server,
  Shield,
  Users,
  Settings,
  FileText,
  Plug,
  Clock,
} from 'lucide-react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { SystemMetrics, AuditLogEntry, HealthCheck } from './types';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Admin Dashboard | LexiFlow',
  description: 'System administration, metrics, and configuration',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getAdminDashboardData() {
  try {
    const [healthResponse, metricsResponse, auditLogsResponse, usersResponse] = await Promise.all([
      apiFetch<HealthCheck[]>(API_ENDPOINTS.HEALTH.CHECK).catch(() => null),
      apiFetch<SystemMetrics>(API_ENDPOINTS.METRICS.SYSTEM).catch(() => null),
      apiFetch<AuditLogEntry[]>(API_ENDPOINTS.AUDIT_LOGS.LIST).catch(() => []),
      apiFetch<unknown[]>(API_ENDPOINTS.USERS.LIST).catch(() => []),
    ]);

    return {
      health: healthResponse,
      metrics: metricsResponse || getDefaultMetrics(),
      auditLogs: Array.isArray(auditLogsResponse) ? auditLogsResponse.slice(0, 5) : [],
      userCount: Array.isArray(usersResponse) ? usersResponse.length : 0,
    };
  } catch (error) {
    console.error('Failed to fetch admin dashboard data:', error);
    return {
      health: null,
      metrics: getDefaultMetrics(),
      auditLogs: [],
      userCount: 0,
    };
  }
}

function getDefaultMetrics(): SystemMetrics {
  return {
    timestamp: new Date().toISOString(),
    system: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      uptime: 0,
      loadAverage: [0, 0, 0],
    },
    application: {
      activeUsers: 0,
      requestsPerMinute: 0,
      averageResponseTime: 0,
      errorRate: 0,
      totalRequests: 0,
    },
    database: {
      connections: 0,
      activeConnections: 0,
      queryTime: 0,
      cacheHitRate: 0,
      poolSize: 100,
    },
  };
}

// =============================================================================
// Components
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

function MetricCard({ title, value, icon, trend, trendUp, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={`font-medium ${
              trendUp
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend}
          </span>
          <span className="ml-2 text-slate-500 dark:text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}

interface HealthBarProps {
  label: string;
  value: number;
  max?: number;
}

function HealthBar({ label, value, max = 100 }: HealthBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const getColor = () => {
    if (percentage > 90) return 'bg-red-600';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
  }
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function QuickAction({ href, icon, title, description, color }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </Link>
  );
}

// =============================================================================
// Loading Components
// =============================================================================

function MetricsLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
        />
      ))}
    </div>
  );
}

function HealthLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

function AuditLogsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Async Content Components
// =============================================================================

async function DashboardMetrics() {
  const { metrics, userCount } = await getAdminDashboardData();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Users"
        value={metrics.application.activeUsers || userCount}
        icon={<Users className="h-6 w-6" />}
        trend="+5%"
        trendUp={true}
        color="blue"
      />
      <MetricCard
        title="System Load"
        value={`${metrics.system.cpuUsage}%`}
        icon={<Server className="h-6 w-6" />}
        trend={metrics.system.cpuUsage > 80 ? 'High' : 'Normal'}
        trendUp={metrics.system.cpuUsage < 80}
        color={metrics.system.cpuUsage > 80 ? 'red' : 'green'}
      />
      <MetricCard
        title="Response Time"
        value={`${metrics.application.averageResponseTime}ms`}
        icon={<Activity className="h-6 w-6" />}
        trend="-12ms"
        trendUp={true}
        color="purple"
      />
      <MetricCard
        title="Storage Used"
        value={`${metrics.system.diskUsage}%`}
        icon={<HardDrive className="h-6 w-6" />}
        trend="+2GB"
        trendUp={false}
        color="orange"
      />
    </div>
  );
}

async function SystemHealthPanel() {
  const { metrics } = await getAdminDashboardData();

  return (
    <div className="space-y-4">
      <HealthBar label="CPU Usage" value={metrics.system.cpuUsage} />
      <HealthBar label="Memory Usage" value={metrics.system.memoryUsage} />
      <HealthBar label="Disk Usage" value={metrics.system.diskUsage} />
      <HealthBar
        label="Database Connections"
        value={metrics.database.connections}
        max={metrics.database.poolSize || 100}
      />
    </div>
  );
}

async function RecentAuditLogs() {
  const { auditLogs } = await getAdminDashboardData();

  if (auditLogs.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
    );
  }

  return (
    <div className="space-y-4">
      {auditLogs.map((log: AuditLogEntry) => (
        <div key={log.id} className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-full p-1.5 ${getSeverityColor(log.severity)}`}
          >
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {log.action} - {log.resourceType}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {log.userName} - {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminDashboardPage() {
  const { metrics } = await getAdminDashboardData();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            System Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitor system health and manage administration settings
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <Suspense fallback={<MetricsLoading />}>
        <DashboardMetrics />
      </Suspense>

      {/* Health and Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              System Health
            </h3>
            <Link
              href="/admin/health"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View Details
            </Link>
          </div>
          <Suspense fallback={<HealthLoading />}>
            <SystemHealthPanel />
          </Suspense>
        </div>

        {/* Recent Audit Logs */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Recent Audit Logs
            </h3>
            <Link
              href="/admin/audit"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View All
            </Link>
          </div>
          <Suspense fallback={<AuditLogsLoading />}>
            <RecentAuditLogs />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/admin/users"
            icon={<Users className="h-5 w-5" />}
            title="Manage Users"
            description="Add or remove accounts"
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <QuickAction
            href="/admin/roles"
            icon={<Shield className="h-5 w-5" />}
            title="Roles & Permissions"
            description="Configure access control"
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <QuickAction
            href="/admin/settings"
            icon={<Settings className="h-5 w-5" />}
            title="System Settings"
            description="Configure system options"
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
          <QuickAction
            href="/admin/integrations"
            icon={<Plug className="h-5 w-5" />}
            title="Integrations"
            description="Connect third-party services"
            color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
        </div>
      </div>

      {/* Additional Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/admin/audit"
          icon={<FileText className="h-5 w-5" />}
          title="Audit Trail"
          description="View activity logs"
          color="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
        />
        <QuickAction
          href="/admin/logs"
          icon={<Activity className="h-5 w-5" />}
          title="System Logs"
          description="View application logs"
          color="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
        />
        <QuickAction
          href="/admin/health"
          icon={<Database className="h-5 w-5" />}
          title="Health Monitor"
          description="Service status"
          color="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
        />
        <QuickAction
          href="/admin/permissions"
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Permissions"
          description="Manage access rights"
          color="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
        />
      </div>
    </div>
  );
}
