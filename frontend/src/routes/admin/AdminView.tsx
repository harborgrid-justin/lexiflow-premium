/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Button } from '@/components/atoms/Button/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { useService } from '@/providers/application/serviceprovider';
import { Activity, ArrowRight, Server, Settings, Shield, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useAdmin } from './AdminContext';

export function AdminView() {
  const { metrics, auditLogs } = useAdmin();
  const { state: { services, pendingOperations }, actions: { checkHealth, syncData, retryFailedOperations, clearQueue } } = useService();

  return (
    <div className="h-full flex flex-col space-y-6">
      <PageHeader title="Administration" subtitle="System Overview & Configuration" />

      {/* Quick Stats / Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="System Status"
          value={services.every(s => s.status === 'healthy') ? 'Healthy' : 'Issues Detected'}
          icon={<Activity className="w-4 h-4" />}
          status={services.every(s => s.status === 'healthy') ? 'success' : 'warning'}
        />
        <StatCard
          label="Active Users"
          value={metrics.application.activeUsers.toString()}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Pending Ops"
          value={pendingOperations.toString()}
          icon={<Server className="w-4 h-4" />}
        />
        <StatCard
          label="Uptime"
          value={`${Math.floor(metrics.system.uptime / 3600)}h`}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

        {/* Left Column: Navigation & Actions */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="border rounded-lg p-6 bg-[var(--color-surface)] border-[var(--color-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Management</h3>
            <div className="space-y-2">
              <NavLink to="users" icon={<Users className="w-4 h-4" />} label="User Management" />
              <NavLink to="settings" icon={<Settings className="w-4 h-4" />} label="System Settings" />
              <NavLink to="audit" icon={<Shield className="w-4 h-4" />} label="Security Audit Log" />
            </div>
          </div>

          {/* System Actions */}
          <div className="border rounded-lg p-6 bg-[var(--color-surface)] border-[var(--color-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">System Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" onClick={() => checkHealth()}>Check Health Now</Button>
              <Button variant="secondary" size="sm" onClick={() => syncData()}>Sync Data</Button>
              {pendingOperations > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                  <Button variant="ghost" size="sm" onClick={() => retryFailedOperations()}>Retry Failed</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dashboard Widgets */}
        <div className="col-span-1 lg:col-span-2 space-y-6">

          {/* Recent Audit */}
          <div className="border rounded-lg p-6 bg-[var(--color-surface)] border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Recent Activity</h3>
              <Link to="audit" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <div className="text-gray-500 text-sm italic">No recent activity.</div>
              ) : (
                auditLogs.map(log => (
                  <AuditLogRow key={log.id} log={log} />
                ))
              )}
            </div>
          </div>

          {/* Service Status List */}
          <div className="border rounded-lg p-6 bg-[var(--color-surface)] border-[var(--color-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Service Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div key={service.name} className="flex items-center justify-between p-3 rounded border border-[var(--color-border-subtle)]">
                  <div>
                    <div className="font-medium capitalize text-[var(--color-text)]">{service.name}</div>
                    <div className="text-xs text-gray-500">Last checked: {new Date(service.lastCheck).toLocaleTimeString()}</div>
                  </div>
                  <ServiceStatusBadge status={service.status} />
                </div>
              ))}
              {services.length === 0 && (
                <div className="text-gray-500 text-sm">Service status unknown.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Helpers ---

function NavLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)] transition-all group">
      <div className="flex items-center gap-3">
        <div className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]">
          {icon}
        </div>
        <span className="text-[var(--color-text)] font-medium">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
    </Link>
  )
}

function StatCard({ label, value, icon, status }: { label: string, value: string, icon: React.ReactNode, status?: 'success' | 'warning' | 'error' }) {
  return (
    <div className="p-4 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-[var(--color-text-muted)] opacity-70">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${status === 'success' ? 'text-green-500' : status === 'warning' ? 'text-amber-500' : status === 'error' ? 'text-red-500' : 'text-[var(--color-text)]'}`}>
        {value}
      </div>
    </div>
  )
}

function AuditLogRow({ log }: { log: any }) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors">
      <div>
        <div className="font-medium text-[var(--color-text)]">{log.action}</div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {log.userName || log.user || 'System'} • {new Date(log.timestamp).toLocaleString()}
        </div>
      </div>
      <Shield className="w-4 h-4 text-[var(--color-text-muted)]" />
    </div>
  );
}

function ServiceStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${colors[status] || colors.unknown}`}>
      {status}
    </span>
  );
}
