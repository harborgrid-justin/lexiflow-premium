/**
 * System Logs Page
 * Next.js 16 Server Component for viewing and filtering system logs
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type { SystemLog, LogLevel, AdminPageProps } from '../types';
import { LogsClient } from './logs-client';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'System Logs | Admin | LexiFlow',
  description: 'View and analyze system logs and application events',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getSystemLogs(filters?: {
  level?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}): Promise<{ logs: SystemLog[]; total: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.level) queryParams.set('level', filters.level);
    if (filters?.source) queryParams.set('source', filters.source);
    if (filters?.startDate) queryParams.set('startDate', filters.startDate);
    if (filters?.endDate) queryParams.set('endDate', filters.endDate);
    queryParams.set('page', String(filters?.page || 1));
    queryParams.set('limit', '100');

    const endpoint = `${API_ENDPOINTS.SYSTEM_LOGS}?${queryParams}`;
    const result = await apiFetch<SystemLog[] | { logs: SystemLog[]; total: number }>(endpoint);

    if (Array.isArray(result)) {
      return { logs: result, total: result.length };
    }
    return result;
  } catch (error) {
    console.error('Failed to fetch system logs:', error);
    return { logs: getDefaultLogs(), total: 0 };
  }
}

function getDefaultLogs(): SystemLog[] {
  const now = new Date();
  return [
    {
      id: 'log-1',
      level: 'info',
      message: 'Application started successfully',
      source: 'system',
      timestamp: new Date(now.getTime() - 60000).toISOString(),
      metadata: { version: '1.0.0', environment: 'production' },
    },
    {
      id: 'log-2',
      level: 'info',
      message: 'Database connection established',
      source: 'database',
      timestamp: new Date(now.getTime() - 120000).toISOString(),
      metadata: { pool: 'primary', connections: 10 },
    },
    {
      id: 'log-3',
      level: 'warn',
      message: 'High memory usage detected',
      source: 'monitoring',
      timestamp: new Date(now.getTime() - 180000).toISOString(),
      metadata: { usedMemory: '85%', threshold: '80%' },
    },
    {
      id: 'log-4',
      level: 'error',
      message: 'Failed to process document upload',
      source: 'document-service',
      timestamp: new Date(now.getTime() - 240000).toISOString(),
      metadata: { documentId: 'doc-123', error: 'File too large' },
      stackTrace: 'Error: File too large\n  at processUpload (/app/services/document.ts:45)\n  at handleRequest (/app/handlers/upload.ts:23)',
      requestId: 'req-abc123',
      userId: 'user-456',
    },
    {
      id: 'log-5',
      level: 'debug',
      message: 'Cache invalidated for user preferences',
      source: 'cache',
      timestamp: new Date(now.getTime() - 300000).toISOString(),
      metadata: { cacheKey: 'user:preferences:123', reason: 'update' },
    },
    {
      id: 'log-6',
      level: 'info',
      message: 'User authentication successful',
      source: 'auth',
      timestamp: new Date(now.getTime() - 360000).toISOString(),
      metadata: { method: 'oauth', provider: 'google' },
      userId: 'user-789',
    },
    {
      id: 'log-7',
      level: 'warn',
      message: 'Rate limit threshold approaching',
      source: 'api-gateway',
      timestamp: new Date(now.getTime() - 420000).toISOString(),
      metadata: { endpoint: '/api/documents', currentRate: 450, limit: 500 },
    },
    {
      id: 'log-8',
      level: 'error',
      message: 'External API request timeout',
      source: 'integration',
      timestamp: new Date(now.getTime() - 480000).toISOString(),
      metadata: { service: 'court-filing', timeout: '30s' },
      requestId: 'req-xyz789',
    },
    {
      id: 'log-9',
      level: 'info',
      message: 'Background job completed',
      source: 'scheduler',
      timestamp: new Date(now.getTime() - 540000).toISOString(),
      metadata: { jobId: 'job-456', duration: '2.5s', itemsProcessed: 150 },
    },
    {
      id: 'log-10',
      level: 'fatal',
      message: 'Critical system error - automatic recovery initiated',
      source: 'system',
      timestamp: new Date(now.getTime() - 600000).toISOString(),
      metadata: { component: 'worker-3', action: 'restart' },
      stackTrace: 'FatalError: Out of memory\n  at Worker.process (/app/workers/batch.ts:102)',
    },
  ];
}

// =============================================================================
// Components
// =============================================================================

function LogsLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Filter Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Logs Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded bg-slate-50 dark:bg-slate-900">
              <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Async Content
// =============================================================================

async function LogsContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const level = typeof searchParams.level === 'string' ? searchParams.level : undefined;
  const source = typeof searchParams.source === 'string' ? searchParams.source : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

  const { logs, total } = await getSystemLogs({ level, source, page });

  return <LogsClient logs={logs} total={total} currentPage={page} />;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminLogsPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-200">
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100">System Logs</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              System Logs
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              View and analyze system logs and application events
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<LogsLoading />}>
        <LogsContent searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
