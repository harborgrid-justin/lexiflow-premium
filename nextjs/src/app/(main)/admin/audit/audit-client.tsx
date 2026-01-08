'use client';

/**
 * Audit Client Component
 * Handles filtering and display of audit logs
 */

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Download, Eye, Clock, User, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AuditLogEntry, AuditAction, AuditSeverity } from '../types';

interface AuditClientProps {
  logs: AuditLogEntry[];
  total: number;
  currentPage: number;
}

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    LOGOUT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    EXPORT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    PERMISSION_CHANGE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    READ: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  };
  return colors[action] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

function getSeverityIcon(severity: string): React.ReactNode {
  switch (severity) {
    case 'critical':
      return <Shield className="h-4 w-4 text-red-500" />;
    case 'high':
      return <Shield className="h-4 w-4 text-orange-500" />;
    case 'medium':
      return <Shield className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ACTIONS: AuditAction[] = [
  'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PERMISSION_CHANGE'
];

const SEVERITIES: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];

export function AuditClient({ logs, total, currentPage }: AuditClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState(searchParams.get('action') || 'all');
  const [severityFilter, setSeverityFilter] = useState(searchParams.get('severity') || 'all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchTerm === '' ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.resourceName && log.resourceName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }, [logs, searchTerm]);

  const stats = useMemo(() => ({
    total: logs.length,
    today: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    highSeverity: logs.filter(l => l.severity === 'high' || l.severity === 'critical').length,
    logins: logs.filter(l => l.action === 'LOGIN').length,
  }), [logs]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/admin/audit?${params.toString()}`);
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name', 'IP Address', 'Severity'];
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.userEmail,
        log.action,
        log.resourceType || '',
        log.resourceName || '',
        log.ipAddress,
        log.severity
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / 50) || 1;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Events</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
          <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">High Severity</p>
          <p className="text-2xl font-bold text-orange-600">{stats.highSeverity}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Logins</p>
          <p className="text-2xl font-bold text-purple-600">{stats.logins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user, resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              handleFilterChange('action', e.target.value);
            }}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            {ACTIONS.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              handleFilterChange('severity', e.target.value);
            }}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>{sev.charAt(0).toUpperCase() + sev.slice(1)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(log.severity)}
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {log.userName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {log.userEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 dark:text-white">
                    {log.resourceName || log.resourceType}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {log.resourceType} {log.resourceId ? `#${log.resourceId}` : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {log.ipAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              No audit logs found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing page {currentPage} of {totalPages} ({total} total entries)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => handleFilterChange('page', String(currentPage - 1))}
            className="flex items-center gap-1 px-3 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => handleFilterChange('page', String(currentPage + 1))}
            className="flex items-center gap-1 px-3 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
