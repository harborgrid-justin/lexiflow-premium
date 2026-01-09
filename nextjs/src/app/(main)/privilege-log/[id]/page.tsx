/**
 * Privilege Log Entry Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowLeft, Calendar, Edit, FileText, Shield, Trash2, User, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PrivilegeLogDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PrivilegeLogDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const entry = await apiFetch(`/privilege-log/${id}`);
    return {
      title: `${entry.documentTitle} | Privilege Log | LexiFlow`,
      description: `Privilege log entry for ${entry.documentTitle}`,
    };
  } catch {
    return { title: 'Entry Not Found' };
  }
}

export default async function PrivilegeLogDetailPage({ params }: PrivilegeLogDetailPageProps) {
  const { id } = await params;

  let entry;
  try {
    entry = await apiFetch(`/privilege-log/${id}`);
  } catch {
    notFound();
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
    'attorney-client': 'Attorney-Client Privilege',
    'work-product': 'Work Product Doctrine',
    'joint-defense': 'Joint Defense Privilege',
    'other': 'Other Privilege',
  };

  return (
    <>
      <PageHeader
        title={entry.documentTitle}
        description={privilegeLabels[entry.privilegeType as keyof typeof privilegeLabels]}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'Privilege Log', href: '/privilege-log' },
          { label: entry.documentTitle },
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
          {/* Document Information */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {entry.documentTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Document ID: {entry.documentId}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Privilege Type</dt>
                  <dd>
                    <Badge variant={privilegeColors[entry.privilegeType as keyof typeof privilegeColors] || 'default'}>
                      {privilegeLabels[entry.privilegeType as keyof typeof privilegeLabels]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <Badge variant={statusColors[entry.status as keyof typeof statusColors] || 'default'}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Author</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    {entry.author}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Date Created</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(entry.dateCreated).toLocaleDateString()}
                  </dd>
                </div>
                {entry.caseId && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Case ID</dt>
                    <dd className="text-slate-900 dark:text-slate-50">{entry.caseId}</dd>
                  </div>
                )}
                {entry.productionId && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Production ID</dt>
                    <dd className="text-slate-900 dark:text-slate-50">{entry.productionId}</dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Privilege Basis */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Privilege Basis
              </h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {entry.basis}
              </p>
            </CardBody>
          </Card>

          {/* Recipients */}
          {entry.recipients && entry.recipients.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-400" />
                  Recipients
                </h3>
                <div className="space-y-2">
                  {entry.recipients.map((recipient: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-900 dark:text-slate-50">{recipient}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  View Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Update Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Add to Production
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Entry
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Related Documents */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Related Documents
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">No related documents</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/privilege-log">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Privilege Log
          </Button>
        </Link>
      </div>
    </>
  );
}
