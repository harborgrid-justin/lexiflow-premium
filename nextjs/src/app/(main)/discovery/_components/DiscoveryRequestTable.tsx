'use client';

/**
 * Discovery Request Table Component
 * Displays discovery requests in a data table with actions
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Badge, Button, Table } from '@/components/ui';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { DiscoveryRequest, DiscoveryRequestStatusValue } from '../_types';
import { deleteDiscoveryRequest, serveDiscoveryRequest } from '../_actions';

interface DiscoveryRequestTableProps {
  requests: DiscoveryRequest[];
  onRefresh?: () => void;
}

const statusConfig: Record<DiscoveryRequestStatusValue, {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  icon: React.ReactNode;
}> = {
  draft: { label: 'Draft', variant: 'default', icon: <FileText className="h-3 w-3" /> },
  pending: { label: 'Pending', variant: 'warning', icon: <Clock className="h-3 w-3" /> },
  served: { label: 'Served', variant: 'info', icon: <Send className="h-3 w-3" /> },
  responded: { label: 'Responded', variant: 'success', icon: <CheckCircle className="h-3 w-3" /> },
  objected: { label: 'Objected', variant: 'warning', icon: <AlertTriangle className="h-3 w-3" /> },
  overdue: { label: 'Overdue', variant: 'danger', icon: <AlertTriangle className="h-3 w-3" /> },
  closed: { label: 'Closed', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  motion_filed: { label: 'Motion Filed', variant: 'warning', icon: <FileText className="h-3 w-3" /> },
};

const typeLabels: Record<string, string> = {
  interrogatories: 'Interrogatories',
  production: 'Production',
  admission: 'Admission',
  deposition: 'Deposition',
  subpoena: 'Subpoena',
};

export function DiscoveryRequestTable({ requests, onRefresh }: DiscoveryRequestTableProps) {
  const [isPending, startTransition] = useTransition();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discovery request?')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteDiscoveryRequest(id);
      if (result.success) {
        onRefresh?.();
      } else {
        alert(result.error || 'Failed to delete');
      }
    });
  };

  const handleServe = async (id: string) => {
    startTransition(async () => {
      const result = await serveDiscoveryRequest(id, 'email');
      if (result.success) {
        onRefresh?.();
      } else {
        alert(result.error || 'Failed to serve');
      }
    });
  };

  const columns = [
    {
      header: 'Request',
      accessor: (row: DiscoveryRequest) => (
        <div className="min-w-0">
          <Link
            href={`/discovery/${row.id}`}
            className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate"
          >
            {row.title}
          </Link>
          {row.requestNumber && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {row.requestNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row: DiscoveryRequest) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {typeLabels[row.requestType] || row.requestType}
        </span>
      ),
    },
    {
      header: 'Parties',
      accessor: (row: DiscoveryRequest) => (
        <div className="text-sm">
          <div className="text-slate-900 dark:text-white truncate max-w-[150px]">
            {row.propoundingParty}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[150px]">
            To: {row.respondingParty}
          </div>
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessor: (row: DiscoveryRequest) => {
        const dueDate = new Date(row.dueDate);
        const isOverdue = dueDate < new Date() && row.status !== 'responded' && row.status !== 'closed';
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
            {dueDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: (row: DiscoveryRequest) => {
        const config = statusConfig[row.status];
        return (
          <Badge variant={config.variant} className="inline-flex items-center gap-1">
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: 'Documents',
      accessor: (row: DiscoveryRequest) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {row.documentCount?.toLocaleString() || '-'}
        </span>
      ),
    },
    {
      header: '',
      accessor: (row: DiscoveryRequest) => (
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            disabled={isPending}
          >
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </button>

          {activeMenu === row.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
              <Link
                href={`/discovery/${row.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Link>
              <Link
                href={`/discovery/${row.id}/documents`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" />
                View Documents
              </Link>
              {row.status === 'draft' && (
                <button
                  onClick={() => handleServe(row.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Send className="h-4 w-4" />
                  Serve Request
                </button>
              )}
              <button
                onClick={() => handleDelete(row.id)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No Discovery Requests
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Create your first discovery request to get started
        </p>
        <Link href="/discovery/new">
          <Button>Create Request</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table
        columns={columns}
        data={requests}
        className="min-w-full"
      />
    </div>
  );
}

/**
 * Compact list view for discovery requests
 */
export function DiscoveryRequestList({ requests }: { requests: DiscoveryRequest[] }) {
  return (
    <div className="space-y-2">
      {requests.map((request) => {
        const config = statusConfig[request.status];
        const dueDate = new Date(request.dueDate);
        const isOverdue = dueDate < new Date() && request.status !== 'responded' && request.status !== 'closed';

        return (
          <Link
            key={request.id}
            href={`/discovery/${request.id}`}
            className="block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white truncate">
                  {request.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {typeLabels[request.requestType]} - {request.propoundingParty} to {request.respondingParty}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                  Due {dueDate.toLocaleDateString()}
                </span>
                <Badge variant={config.variant}>
                  {config.label}
                </Badge>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
