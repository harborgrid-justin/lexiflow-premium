/**
 * Privilege Log Page - Discovery Privilege Tracking
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { Download, FileText, Filter, Plus, Shield } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Privilege Log | LexiFlow',
  description: 'Manage privilege logs for discovery',
};

interface PrivilegeLogEntry {
  id: string;
  caseId: string;
  productionId?: string;
  documentId: string;
  documentTitle: string;
  privilegeType: 'attorney-client' | 'work-product' | 'joint-defense' | 'other';
  basis: string;
  dateCreated: string;
  author: string;
  recipients?: string[];
  status: 'withheld' | 'redacted' | 'logged';
}

async function PrivilegeLogTable() {
  let entries: PrivilegeLogEntry[] = [];
  let error = null;

  try {
    const response = await apiFetch('/privilege-log');
    entries = Array.isArray(response) ? response : response.items || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load privilege log';
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </CardBody>
      </Card>
    );
  }

  const privilegeColors = {
    'attorney-client': 'info',
    'work-product': 'success',
    'joint-defense': 'warning',
    'other': 'default',
  } as const;

  const statusColors = {
    withheld: 'danger',
    redacted: 'warning',
    logged: 'default',
  } as const;

  const privilegeLabels = {
    'attorney-client': 'Attorney-Client',
    'work-product': 'Work Product',
    'joint-defense': 'Joint Defense',
    'other': 'Other',
  };

  const columns = [
    {
      header: 'Document',
      accessor: (row: PrivilegeLogEntry) => (
        <Link href={`/privilege-log/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {row.documentTitle}
        </Link>
      ),
    },
    {
      header: 'Privilege Type',
      accessor: (row: PrivilegeLogEntry) => (
        <Badge variant={privilegeColors[row.privilegeType]}>
          {privilegeLabels[row.privilegeType]}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row: PrivilegeLogEntry) => (
        <Badge variant={statusColors[row.status]}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    { header: 'Author', accessor: 'author' as const },
    {
      header: 'Date',
      accessor: (row: PrivilegeLogEntry) => new Date(row.dateCreated).toLocaleDateString(),
    },
    {
      header: 'Basis',
      accessor: (row: PrivilegeLogEntry) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1" title={row.basis}>
          {row.basis}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: PrivilegeLogEntry) => (
        <Link href={`/privilege-log/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {entries.length > 0 ? (
          <Table columns={columns} data={entries} />
        ) : (
          <EmptyState
            title="No privilege log entries"
            description="Add your first privilege log entry"
            action={
              <Link href="/privilege-log/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add Entry
                </Button>
              </Link>
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function PrivilegeLogPage() {
  return (
    <>
      <PageHeader
        title="Privilege Log"
        description="Document privilege assertions for discovery"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'Privilege Log' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Link href="/privilege-log/new">
              <Button icon={<Plus className="h-4 w-4" />}>Add Entry</Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Entries</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">156</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Attorney-Client</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">89</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Work Product</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">52</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Other</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">15</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              placeholder="Search privilege log..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
            <div className="flex gap-2">
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Privilege Types</option>
                <option value="attorney-client">Attorney-Client</option>
                <option value="work-product">Work Product</option>
                <option value="joint-defense">Joint Defense</option>
                <option value="other">Other</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Statuses</option>
                <option value="withheld">Withheld</option>
                <option value="redacted">Redacted</option>
                <option value="logged">Logged</option>
              </select>
              <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                More Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Privilege Log Table */}
      <Suspense
        fallback={
          <Card>
            <CardBody className="p-0">
              <div className="px-6 py-4">
                <SkeletonLine lines={5} className="h-12" />
              </div>
            </CardBody>
          </Card>
        }
      >
        <PrivilegeLogTable />
      </Suspense>
    </>
  );
}
