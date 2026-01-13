'use client';

/**
 * Logs Client Component
 * Handles filtering and display of system logs
 */

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Filter, Download, ChevronDown, ChevronRight,
  AlertCircle, AlertTriangle, Info, Bug, XCircle, Clock, ChevronLeft
} from 'lucide-react';
import type { SystemLog, LogLevel } from '../types';

interface LogsClientProps {
  logs: SystemLog[];
  total: number;
  currentPage: number;
}

// =============================================================================
// Log Level Utilities
// =============================================================================

function getLevelIcon(level: LogLevel): React.ReactNode {
  const icons: Record<LogLevel, React.ReactNode> = {
    debug: <Bug className="h-4 w-4 text-slate-400" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
    warn: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    fatal: <XCircle className="h-4 w-4 text-red-700" />,
  };
  return icons[level];
}

function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    debug: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    fatal: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
  };
  return colors[level];
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// =============================================================================
// Log Entry Component
// =============================================================================

interface LogEntryProps {
  log: SystemLog;
}

function LogEntry({ log }: LogEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button type="button" className="mt-0.5 text-slate-400">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
          {getLevelIcon(log.level)}
          {log.level.toUpperCase()}
        </span>

        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          [{log.source}]
        </span>

        <span className="flex-1 text-sm text-slate-900 dark:text-white truncate">
          {log.message}
        </span>

        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTimestamp(log.timestamp)}
        </span>
      </div>

      {isExpanded && (
        <div className="px-10 pb-4 space-y-3">
          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Metadata</h4>
              <pre className="p-2 rounded bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Stack Trace */}
          {log.stackTrace && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Stack Trace</h4>
              <pre className="p-2 rounded bg-red-50 dark:bg-red-900/20 text-xs text-red-700 dark:text-red-300 overflow-x-auto whitespace-pre-wrap">
                {log.stackTrace}
              </pre>
            </div>
          )}

          {/* Additional Info */}
          <div className="flex gap-4 text-xs">
            {log.requestId && (
              <span className="text-slate-500 dark:text-slate-400">
                Request ID: <code className="px-1 bg-slate-100 dark:bg-slate-700 rounded">{log.requestId}</code>
              </span>
            )}
            {log.userId && (
              <span className="text-slate-500 dark:text-slate-400">
                User ID: <code className="px-1 bg-slate-100 dark:bg-slate-700 rounded">{log.userId}</code>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Constants
// =============================================================================

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

const SOURCES = [
  'system',
  'database',
  'auth',
  'api-gateway',
  'document-service',
  'cache',
  'monitoring',
  'scheduler',
  'integration',
];

// =============================================================================
// Main Component
// =============================================================================

export function LogsClient({ logs, total, currentPage }: LogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState(searchParams.get('level') || 'all');
  const [sourceFilter, setSourceFilter] = useState(searchParams.get('source') || 'all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchTerm === '' ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [logs, searchTerm]);

  const stats = useMemo(() => ({
    total: logs.length,
    debug: logs.filter((l) => l.level === 'debug').length,
    info: logs.filter((l) => l.level === 'info').length,
    warn: logs.filter((l) => l.level === 'warn').length,
    error: logs.filter((l) => l.level === 'error').length,
    fatal: logs.filter((l) => l.level === 'fatal').length,
  }), [logs]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/admin/logs?${params.toString()}`);
  };

  const handleExport = () => {
    const logData = filteredLogs.map((log) => ({
      timestamp: log.timestamp,
      level: log.level,
      source: log.source,
      message: log.message,
      metadata: JSON.stringify(log.metadata || {}),
      stackTrace: log.stackTrace || '',
      requestId: log.requestId || '',
      userId: log.userId || '',
    }));

    const headers = ['Timestamp', 'Level', 'Source', 'Message', 'Metadata', 'Stack Trace', 'Request ID', 'User ID'];
    const csvRows = [
      headers.join(','),
      ...logData.map((log) =>
        [
          log.timestamp,
          log.level,
          log.source,
          `"${log.message.replace(/"/g, '""')}"`,
          `"${log.metadata.replace(/"/g, '""')}"`,
          `"${log.stackTrace.replace(/"/g, '""')}"`,
          log.requestId,
          log.userId,
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / 100) || 1;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Debug</p>
          <p className="text-2xl font-bold text-slate-600">{stats.debug}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Info</p>
          <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Warnings</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.warn}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Errors</p>
          <p className="text-2xl font-bold text-red-600">{stats.error}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Fatal</p>
          <p className="text-2xl font-bold text-red-800">{stats.fatal}</p>
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
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              handleFilterChange('level', e.target.value);
            }}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            {LOG_LEVELS.map((level) => (
              <option key={level} value={level}>{level.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              handleFilterChange('source', e.target.value);
            }}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sources</option>
            {SOURCES.map((source) => (
              <option key={source} value={source}>{source}</option>
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

      {/* Logs List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredLogs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Bug className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              No logs found
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
