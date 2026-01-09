/**
 * ESI Source Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowLeft, Calendar, Cloud, Database, Edit, HardDrive, Mail, Server, Smartphone, Trash2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ESISourceDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ESISourceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const source = await apiFetch(`/esi-sources/${id}`);
    return {
      title: `${source.name} | ESI Sources | LexiFlow`,
      description: `ESI source details for ${source.name}`,
    };
  } catch {
    return { title: 'ESI Source Not Found' };
  }
}

export default async function ESISourceDetailPage({ params }: ESISourceDetailPageProps) {
  const { id } = await params;

  let source;
  try {
    source = await apiFetch(`/esi-sources/${id}`);
  } catch {
    notFound();
  }

  const statusColors = {
    identified: 'default',
    preserved: 'info',
    collected: 'warning',
    processed: 'purple',
    reviewed: 'success',
  } as const;

  const typeIcons = {
    email: <Mail className="h-5 w-5" />,
    file_server: <Server className="h-5 w-5" />,
    database: <Database className="h-5 w-5" />,
    cloud_storage: <Cloud className="h-5 w-5" />,
    mobile_device: <Smartphone className="h-5 w-5" />,
    social_media: <Cloud className="h-5 w-5" />,
    application: <HardDrive className="h-5 w-5" />,
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
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <>
      <PageHeader
        title={source.name}
        description={`${typeLabels[source.sourceType as keyof typeof typeLabels]} Source`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'ESI Sources', href: '/esi-sources' },
          { label: source.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Source Details */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400">
                    {typeIcons[source.sourceType as keyof typeof typeIcons]}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {source.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {typeLabels[source.sourceType as keyof typeof typeLabels]}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <Badge variant={statusColors[source.status as keyof typeof statusColors] || 'default'}>
                      {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Custodian</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {source.custodianName || 'Not assigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Location</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {source.location || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Case ID</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {source.caseId}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Estimated Size</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {formatSize(source.estimatedSize)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Actual Size</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {formatSize(source.actualSize)}
                  </dd>
                </div>
                {source.collectionDate && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Collection Date</dt>
                    <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(source.collectionDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {source.dateRange && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Date Range</dt>
                    <dd className="text-slate-900 dark:text-slate-50">
                      {new Date(source.dateRange.start).toLocaleDateString()} - {new Date(source.dateRange.end).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Description */}
          {source.description && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {source.description}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Metadata */}
          {source.metadata && Object.keys(source.metadata).length > 0 && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Metadata
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(source.metadata).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-slate-500 dark:text-slate-400">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </dt>
                      <dd className="text-slate-900 dark:text-slate-50">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Workflow */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Collection Workflow
              </h3>
              <div className="space-y-3">
                {['identified', 'preserved', 'collected', 'processed', 'reviewed'].map((step, index) => {
                  const isCompleted = ['identified', 'preserved', 'collected', 'processed', 'reviewed'].indexOf(source.status) >= index;
                  const isCurrent = source.status === step;
                  return (
                    <div key={step} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-sm ${isCompleted ? 'text-slate-900 dark:text-slate-50' : 'text-slate-500'}`}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Update Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Start Collection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Process Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Metadata
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/esi-sources">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to ESI Sources
          </Button>
        </Link>
      </div>
    </>
  );
}
