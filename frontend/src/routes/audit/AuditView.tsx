/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Audit Domain - View Component
 */

import { AlertCircle, AlertTriangle, Info, Shield } from 'lucide-react';
import React, { useId } from 'react';

import { PageHeader } from '@/components/organisms/PageHeader';
import { EmptyState } from '@/routes/_shared/EmptyState';

import { useAudit } from './AuditProvider';

export function AuditView() {
  const { logs, severityFilter, setSeverityFilter, searchTerm, setSearchTerm, metrics, isPending } = useAudit();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Audit Logs"
        subtitle="System activity and security monitoring"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Logs"
          value={metrics.totalLogs}
        />
        <MetricCard
          icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          label="Critical"
          value={metrics.criticalCount}
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Warnings"
          value={metrics.warningCount}
        />
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search logs</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <FilterButton active={severityFilter === 'all'} onClick={() => setSeverityFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={severityFilter === 'Info'} onClick={() => setSeverityFilter('Info')}>
            <Info className="w-4 h-4" />
            Info
          </FilterButton>
          <FilterButton active={severityFilter === 'Warning'} onClick={() => setSeverityFilter('Warning')}>
            <AlertTriangle className="w-4 h-4" />
            Warning
          </FilterButton>
          <FilterButton active={severityFilter === 'Critical'} onClick={() => setSeverityFilter('Critical')}>
            <AlertCircle className="w-4 h-4" />
            Critical
          </FilterButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <>
            {logs.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No audit logs found"
                message="System activity will appear here as actions are performed"
              />
            ) : (
              <div className="space-y-2">
                {logs.map(log => (
                  <AuditLogRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type AuditLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  severity: 'Info' | 'Warning' | 'Critical';
  ipAddress: string;
};

const severityConfig = {
  Info: { icon: Info, color: 'text-blue-600 dark:text-blue-400' },
  Warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400' },
  Critical: { icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400' },
};

function AuditLogRow({ log }: { log: AuditLog }) {
  const SeverityIcon = severityConfig[log.severity].icon;
  const severityColor = severityConfig[log.severity].color;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start gap-3">
        <SeverityIcon className={`w-5 h-5 ${severityColor} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-white mb-1">
                {log.action}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {log.resource} • ID: {log.resourceId}
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap ml-4">
              {new Date(log.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
            <span>User: {log.userName}</span>
            <span>IP: {log.ipAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
