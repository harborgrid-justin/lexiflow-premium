/**
 * Admin Panel Route
 *
 * Administrative dashboard with:
 * - Server-side data loading via loader
 * - System configuration access
 * - User management links
 * - Audit and security settings
 *
 * @module routes/admin/index
 */

import { api } from '@/api';
import type { SystemMetrics } from '@/api/admin/metrics-api';
import { requireAdmin } from '@/utils/route-guards';
import {
  Activity,
  AlertTriangle,
  Database,
  HardDrive,
  Server,
  Shield,
  Users
} from 'lucide-react';
import { Link } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createAdminMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return createAdminMeta({
    section: 'Dashboard',
    description: 'System administration and configuration',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // Require admin role to access this route
  const { user } = requireAdmin(request);

  try {
    // Fetch system metrics
    const metrics = await api.metrics.getCurrent();

    // Fetch user stats (assuming we can get a count or list)
    // For now, we'll just use the metrics active users if available, or fetch users
    // const users = await api.users.getAll();

    // Fetch recent audit logs
    const allLogs = await api.auditLogs.getAll();
    const auditLogs = allLogs.slice(0, 5);
    return {
      user,
      metrics,
      auditLogs,
    };
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);

    // Return fallback data if API fails
    return {
      user,
      metrics: {
        timestamp: new Date().toISOString(),
        system: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          uptime: 0,
        },
        application: {
          activeUsers: 0,
          requestsPerMinute: 0,
          averageResponseTime: 0,
          errorRate: 0,
        },
        database: {
          connections: 0,
          queryTime: 0,
          cacheHitRate: 0,
        },
      } as SystemMetrics,
      auditLogs: [],
    };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function AdminIndexRoute() {
  const { metrics, auditLogs } = loaderData;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Activity className="h-4 w-4" />
          <span>Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Users"
          value={metrics.application.activeUsers}
          icon={Users}
          trend="+5%"
          trendUp={true}
          color="blue"
        />
        <MetricCard
          title="System Load"
          value={`${metrics.system.cpuUsage}%`}
          icon={Server}
          trend={metrics.system.cpuUsage > 80 ? "High" : "Normal"}
          trendUp={metrics.system.cpuUsage < 80}
          color={metrics.system.cpuUsage > 80 ? "red" : "green"}
        />
        <MetricCard
          title="Response Time"
          value={`${metrics.application.averageResponseTime}ms`}
          icon={Activity}
          trend="-12ms"
          trendUp={true}
          color="purple"
        />
        <MetricCard
          title="Storage Used"
          value={`${metrics.system.diskUsage}%`}
          icon={HardDrive}
          trend="+2GB"
          trendUp={false}
          color="orange"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
          <div className="space-y-4">
            <HealthBar label="CPU Usage" value={metrics.system.cpuUsage} />
            <HealthBar label="Memory Usage" value={metrics.system.memoryUsage} />
            <HealthBar label="Disk Usage" value={metrics.system.diskUsage} />
            <HealthBar label="Database Connections" value={metrics.database.connections} max={100} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Audit Logs</h3>
            <Link to="audit" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
            ) : (
              auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1.5 ${log.severity === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.action} - {log.entityType}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.userName} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="users"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add or remove accounts</p>
          </div>
        </Link>
        <Link
          to="database"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Database</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Backups and maintenance</p>
          </div>
        </Link>
        <Link
          to="security"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Security</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Policies and logs</p>
          </div>
        </Link>
        <Link
          to="alerts"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">System Alerts</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">View active alerts</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-full p-3 bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend}
        </span>
        <span className="ml-2 text-gray-500 dark:text-gray-400">vs last month</span>
      </div>
    </div>
  );
}

function HealthBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  const color = percentage > 90 ? 'bg-red-600' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Admin Dashboard"
      message="We couldn't load the admin dashboard. Please try again."
    />
  );
}
