import { Button } from '@/components/atoms/Button/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { useTheme } from "@/hooks/useTheme";
import { useService } from '@/providers/application/serviceprovider';
import { Activity, Settings, Shield, Users } from 'lucide-react';
import { useAdmin } from './AdminProvider';

export function AdminView() {
  const { users, auditLogs, activeTab, setActiveTab, isPending } = useAdmin();
  const { state: { services, pendingOperations }, actions: { checkHealth, syncData, retryFailedOperations, clearQueue } } = useService();

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Administration" subtitle="System settings and user management">
        <Button variant="primary" size="md">
          <Users className="w-4 h-4" />
          Add User
        </Button>
      </PageHeader>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
        <nav className="flex space-x-4">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} disabled={isPending}>
            <Users className="w-4 h-4" />
            Users ({users.length})
          </TabButton>
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} disabled={isPending}>
            <Settings className="w-4 h-4" />
            Settings
          </TabButton>
          <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} disabled={isPending}>
            <Shield className="w-4 h-4" />
            Audit Log ({auditLogs.length})
          </TabButton>
          <TabButton active={activeTab === 'health'} onClick={() => setActiveTab('health')} disabled={isPending}>
            <Activity className="w-4 h-4" />
            System Health
          </TabButton>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
        {activeTab === 'settings' && (
          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
            <h3 style={{ color: 'var(--color-text)' }} className="text-lg font-semibold mb-4">System Settings</h3>
            <div className="space-y-4">
              <SettingRow label="Firm Name" value="LexiFlow Legal" />
              <SettingRow label="Time Zone" value="America/New_York" />
              <SettingRow label="Billing Currency" value="USD" />
            </div>
          </div>
        )}
        {activeTab === 'audit' && (
          <div className="space-y-2">
            {auditLogs.map(log => (
              <AuditLogRow key={log.id} log={log} />
            ))}
          </div>
        )}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Pending Operations</h3>
                <div className="text-3xl font-bold">{pendingOperations}</div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => retryFailedOperations()}>Retry Failed</Button>
                  <Button variant="text" size="sm" onClick={() => clearQueue()}>Clear Completed</Button>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="primary" size="sm" onClick={() => checkHealth()}>Check Health Now</Button>
                  <Button variant="secondary" size="sm" onClick={() => syncData()}>Sync Data</Button>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Service Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <div key={service.name} className="flex items-center justify-between p-3 rounded border" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <div>
                      <div className="font-medium capitalize">{service.name}</div>
                      <div className="text-xs text-gray-500">Last checked: {new Date(service.lastCheck).toLocaleTimeString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${paramsToStatusColor(service.status)}`} />
                      <span className="text-sm capitalize">{service.status}</span>
                      {service.responseTime > 0 && <span className="text-xs text-gray-400">({service.responseTime}ms)</span>}
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No health data available. Click "Check Health Now" to refresh.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function paramsToStatusColor(status: string) {
  switch (status) {
    case 'healthy': return 'bg-green-500';
    case 'degraded': return 'bg-yellow-500';
    case 'down':
    case 'unhealthy': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

function TabButton({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  const { theme, tokens } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.medium,
        borderBottom: active ? `2px solid ${tokens.colors.blue500}` : '2px solid transparent',
        color: active ? tokens.colors.blue500 : theme.text.secondary,
        transition: tokens.transitions.smooth,
      }}
      className="flex items-center gap-2"
    >
      {children}
    </button>
  );
}

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

function UserCard({ user }: { user: AdminUser }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
          {user.name.charAt(0)}
        </div>
        <div>
          <div style={{ color: 'var(--color-text)' }} className="font-medium">{user.name}</div>
          <div style={{ color: 'var(--color-textMuted)' }} className="text-sm">{user.email}</div>
        </div>
      </div>
      <div style={{ color: 'var(--color-textMuted)' }} className="text-xs">
        Role: <span className="font-medium">{user.role}</span>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function AuditLogRow({ log }: { log: Record<string, unknown> }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ color: 'var(--color-text)' }} className="font-medium">{log.action}</div>
          <div style={{ color: 'var(--color-textMuted)' }} className="text-sm">
            {log.user} • {new Date(log.timestamp).toLocaleString()}
          </div>
        </div>
        <Shield className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  );
}
