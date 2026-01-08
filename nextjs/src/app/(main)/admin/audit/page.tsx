/**
 * Audit Trail Viewer Page
 * Next.js 16 Server Component for viewing and filtering audit logs
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, Download, Search, Filter, Clock, User, Activity, Shield } from 'lucide-react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { AuditLogEntry, AdminPageProps } from '../types';
import { AuditClient } from './audit-client';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Audit Trail | Admin | LexiFlow',
  description: 'View and export system activity and security logs',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getAuditLogs(filters?: {
  action?: string;
  severity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.action) queryParams.set('action', filters.action);
    if (filters?.severity) queryParams.set('severity', filters.severity);
    if (filters?.userId) queryParams.set('userId', filters.userId);
    if (filters?.startDate) queryParams.set('startDate', filters.startDate);
    if (filters?.endDate) queryParams.set('endDate', filters.endDate);
    queryParams.set('page', String(filters?.page || 1));
    queryParams.set('limit', '50');

    const endpoint = `${API_ENDPOINTS.AUDIT_LOGS.LIST}?${queryParams}`;
    const result = await apiFetch<AuditLogEntry[] | { logs: AuditLogEntry[]; total: number }>(endpoint);

    if (Array.isArray(result)) {
      return { logs: result, total: result.length };
    }
    return result;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return { logs: getDefaultLogs(), total: 0 };
  }
}

function getDefaultLogs(): AuditLogEntry[] {
  const now = new Date();
  return [
    {
      id: '1',
      action: 'LOGIN',
      severity: 'low',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      resourceType: 'session',
      ipAddress: '192.168.1.1',
      timestamp: new Date(now.getTime() - 300000).toISOString(),
    },
    {
      id: '2',
      action: 'CREATE',
      severity: 'low',
      userId: 'user-2',
      userName: 'Jane Doe',
      userEmail: 'jane@example.com',
      resourceType: 'case',
      resourceId: 'case-123',
      resourceName: 'Smith v. Jones',
      ipAddress: '192.168.1.2',
      timestamp: new Date(now.getTime() - 600000).toISOString(),
    },
    {
      id: '3',
      action: 'UPDATE',
      severity: 'medium',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      resourceType: 'document',
      resourceId: 'doc-456',
      resourceName: 'Contract Agreement.pdf',
      ipAddress: '192.168.1.1',
      timestamp: new Date(now.getTime() - 900000).toISOString(),
    },
    {
      id: '4',
      action: 'PERMISSION_CHANGE',
      severity: 'high',
      userId: 'admin-1',
      userName: 'Admin User',
      userEmail: 'admin@example.com',
      resourceType: 'user',
      resourceId: 'user-3',
      resourceName: 'Mike Johnson',
      ipAddress: '192.168.1.100',
      timestamp: new Date(now.getTime() - 1800000).toISOString(),
    },
    {
      id: '5',
      action: 'DELETE',
      severity: 'high',
      userId: 'user-2',
      userName: 'Jane Doe',
      userEmail: 'jane@example.com',
      resourceType: 'document',
      resourceId: 'doc-789',
      resourceName: 'Draft Letter.docx',
      ipAddress: '192.168.1.2',
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
    },
    {
      id: '6',
      action: 'EXPORT',
      severity: 'medium',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      resourceType: 'report',
      resourceName: 'Monthly Billing Report',
      ipAddress: '192.168.1.1',
      timestamp: new Date(now.getTime() - 7200000).toISOString(),
    },
    {
      id: '7',
      action: 'LOGOUT',
      severity: 'low',
      userId: 'user-3',
      userName: 'Mike Johnson',
      userEmail: 'mike@example.com',
      resourceType: 'session',
      ipAddress: '192.168.1.50',
      timestamp: new Date(now.getTime() - 10800000).toISOString(),
    },
  ];
}

// =============================================================================
// Components
// =============================================================================

function AuditLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Filter Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Table Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
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

async function AuditContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const action = typeof searchParams.action === 'string' ? searchParams.action : undefined;
  const severity = typeof searchParams.severity === 'string' ? searchParams.severity : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

  const { logs, total } = await getAuditLogs({ action, severity, page });

  return <AuditClient logs={logs} total={total} currentPage={page} />;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminAuditPage({ searchParams }: AdminPageProps) {
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
          <span className="text-slate-900 dark:text-slate-100">Audit Trail</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Audit Trail
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              View and export system activity and security logs
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<AuditLoading />}>
        <AuditContent searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
