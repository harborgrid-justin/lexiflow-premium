/**
 * Audit Trail Route
 * Complete audit log viewer with filtering and search
 */

import { DateRangeSelector } from '@/components/enterprise/analytics';
import type { AuditLog } from '@/types/analytics-enterprise';
import { subDays } from 'date-fns';
import { AlertCircle, Download, Search, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

import { useLoaderData } from 'react-router';
// import type { Route } from './+types/index';

export function meta() {
  return createMeta({
    title: 'Audit Trail',
    description: 'System audit logs and compliance tracking',
  });
}

import { DataService } from '@/services/data/dataService';

/**
 * Fetches audit logs on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader() {
  try {
    const logs = await DataService.security.getAuditLogs();
    return { logs: logs as AuditLog[] };
  } catch (error) {
    console.error("Failed to load audit logs", error);
    return { logs: [] };
  }
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

export default function AuditTrailRoute() {
  const { logs } = useLoaderData<typeof clientLoader>();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 Days',
  });

  const filteredLogs = logs.filter((log: AuditLog) => {
    const matchesSearch =
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesAction && matchesCategory && matchesSeverity;
  });

  const getActionIcon = (action: string) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔐',
      logout: '👋',
      export: '📤',
      access_denied: '🚫',
    };
    return icons[action as keyof typeof icons] || '📝';
  };

  const getActionColor = (action: string) => {
    const colors = {
      create: 'text-green-600 dark:text-green-400',
      update: 'text-blue-600 dark:text-blue-400',
      delete: 'text-red-600 dark:text-red-400',
      login: 'text-purple-600 dark:text-purple-400',
      logout: 'text-gray-600 dark:text-gray-400',
      export: 'text-yellow-600 dark:text-yellow-400',
      access_denied: 'text-red-600 dark:text-red-400',
    };
    return colors[action as keyof typeof colors] || 'text-gray-600';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      authentication: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      authorization: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      data_access: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      data_modification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      system_config: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      security: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      compliance: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Audit Trail
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Complete system activity log for compliance and security monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, action, or entity..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="export">Export</option>
            <option value="access_denied">Access Denied</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="system_config">System Config</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {(filterAction !== 'all' || filterCategory !== 'all' || filterSeverity !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setFilterAction('all');
                setFilterCategory('all');
                setFilterSeverity('all');
                setSearchTerm('');
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredLogs.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {log.userName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${getActionColor(log.action)}`}>
                      <span>{getActionIcon(log.action)}</span>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {log.entityName || log.entityId}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {log.entityType}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(log.category)}`}>
                      {log.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity === 'critical' && <AlertCircle className="h-3 w-3" />}
                      {log.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No audit logs found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {filteredLogs.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {new Set(filteredLogs.map((log: AuditLog) => log.userId)).size}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Events</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
            {filteredLogs.filter((log: AuditLog) => log.severity === 'critical').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Events</p>
          <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
            {filteredLogs.filter((log: AuditLog) => log.category === 'security').length}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Audit Log Error"
      message="Failed to load audit logs. Please try again later."
    />
  );
}
