import { Settings, Shield, Users } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { useAdmin } from './AdminProvider';

export function AdminView() {
  const { users, auditLogs, activeTab, setActiveTab, isPending } = useAdmin();

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
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Settings</h3>
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
      </div>
    </div>
  );
}

function TabButton({ active, onClick, disabled, children }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400'
        }`}
    >
      {children}
    </button>
  );
}

function UserCard({ user }: { user: any }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
          {user.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
        </div>
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400">
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

function AuditLogRow({ log }: { log: any }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{log.action}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {log.user} • {new Date(log.timestamp).toLocaleString()}
          </div>
        </div>
        <Shield className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  );
}
