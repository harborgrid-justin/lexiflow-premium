/**
 * ESI Sources Page - Electronically Stored Information Management
 * Discovery/eDiscovery data sources tracking
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { Cloud, Database, HardDrive, Mail, Plus, Server, Smartphone } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ESI Sources | LexiFlow',
  description: 'Manage electronically stored information sources for discovery',
};

interface ESISource {
  id: string;
  caseId: string;
  custodianId?: string;
  custodianName?: string;
  sourceType: 'email' | 'file_server' | 'database' | 'cloud_storage' | 'mobile_device' | 'social_media' | 'application';
  name: string;
  description?: string;
  location?: string;
  status: 'identified' | 'preserved' | 'collected' | 'processed' | 'reviewed';
  estimatedSize?: number;
  actualSize?: number;
  collectionDate?: string;
}

async function ESISourcesList() {
  let sources: ESISource[] = [];
  let error = null;

  try {
    const response = await apiFetch('/esi-sources');
    sources = Array.isArray(response) ? response : response.items || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load ESI sources';
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

  const statusColors = {
    identified: 'default',
    preserved: 'info',
    collected: 'warning',
    processed: 'purple',
    reviewed: 'success',
  } as const;

  const typeIcons = {
    email: <Mail className="h-4 w-4" />,
    file_server: <Server className="h-4 w-4" />,
    database: <Database className="h-4 w-4" />,
    cloud_storage: <Cloud className="h-4 w-4" />,
    mobile_device: <Smartphone className="h-4 w-4" />,
    social_media: <Cloud className="h-4 w-4" />,
    application: <HardDrive className="h-4 w-4" />,
  };

  const typeLabels = {
    email: 'Email',
    file_server: 'File Server',
    database: 'Database',
    cloud_storage: 'Cloud Storage',
    mobile_device: 'Mobile Device',
    social_media: 'Social Media',
    application: 'Application',
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const columns = [
    {
      header: 'Source',
      accessor: (row: ESISource) => (
        <Link href={`/esi-sources/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2">
          {typeIcons[row.sourceType]}
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Type',
      accessor: (row: ESISource) => (
        <Badge variant="default">{typeLabels[row.sourceType]}</Badge>
      ),
    },
    {
      header: 'Custodian',
      accessor: (row: ESISource) => row.custodianName || '-',
    },
    {
      header: 'Status',
      accessor: (row: ESISource) => (
        <Badge variant={statusColors[row.status]}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Est. Size',
      accessor: (row: ESISource) => formatSize(row.estimatedSize),
    },
    {
      header: 'Actual Size',
      accessor: (row: ESISource) => formatSize(row.actualSize),
    },
    {
      header: 'Collected',
      accessor: (row: ESISource) => row.collectionDate ? new Date(row.collectionDate).toLocaleDateString() : '-',
    },
    {
      header: 'Actions',
      accessor: (row: ESISource) => (
        <Link href={`/esi-sources/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {sources.length > 0 ? (
          <Table columns={columns} data={sources} />
        ) : (
          <EmptyState
            title="No ESI sources found"
            description="Add your first electronically stored information source"
            action={
              <Link href="/esi-sources/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add ESI Source
                </Button>
              </Link>
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function ESISourcesPage() {
  return (
    <>
      <PageHeader
        title="ESI Sources"
        description="Electronically stored information sources for discovery"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'ESI Sources' },
        ]}
        actions={
          <Link href="/esi-sources/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add ESI Source</Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">12</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Sources</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Identified</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">5</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Collected</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Processing</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">2</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Reviewed</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              placeholder="Search ESI sources..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
            <div className="flex gap-2">
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Types</option>
                <option value="email">Email</option>
                <option value="file_server">File Server</option>
                <option value="database">Database</option>
                <option value="cloud_storage">Cloud Storage</option>
                <option value="mobile_device">Mobile Device</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Statuses</option>
                <option value="identified">Identified</option>
                <option value="preserved">Preserved</option>
                <option value="collected">Collected</option>
                <option value="processed">Processed</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ESI Sources Table */}
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
        <ESISourcesList />
      </Suspense>
    </>
  );
}
