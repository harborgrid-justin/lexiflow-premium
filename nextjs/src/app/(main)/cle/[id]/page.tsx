/**
 * CLE Credit Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowLeft, Download, Edit, FileText, Trash2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CLEDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CLEDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const credit = await apiFetch(`/cle/credits/${id}`);
    return {
      title: `${credit.courseName} | CLE | LexiFlow`,
      description: `CLE credit details for ${credit.courseName}`,
    };
  } catch {
    return { title: 'CLE Credit Not Found' };
  }
}

export default async function CLEDetailPage({ params }: CLEDetailPageProps) {
  const { id } = await params;

  let credit;
  try {
    credit = await apiFetch(`/cle/credits/${id}`);
  } catch {
    notFound();
  }

  const statusColors = {
    Completed: 'success',
    Pending: 'warning',
    Verified: 'info',
  } as const;

  const categoryColors = {
    Ethics: 'info',
    General: 'default',
    Specialty: 'warning',
  } as const;

  return (
    <>
      <PageHeader
        title={credit.courseName}
        description={`${credit.credits} credits • ${credit.category}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'CLE', href: '/cle' },
          { label: credit.courseName },
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
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Credit Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Course Name</dt>
                  <dd className="text-slate-900 dark:text-slate-50 font-medium">{credit.courseName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Provider</dt>
                  <dd className="text-slate-900 dark:text-slate-50">{credit.provider}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Credits Earned</dt>
                  <dd className="text-slate-900 dark:text-slate-50 font-medium text-lg">{credit.credits}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Category</dt>
                  <dd>
                    <Badge variant={categoryColors[credit.category as keyof typeof categoryColors] || 'default'}>
                      {credit.category}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Date Completed</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {new Date(credit.date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Jurisdiction</dt>
                  <dd className="text-slate-900 dark:text-slate-50">{credit.jurisdiction}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <Badge variant={statusColors[credit.status as keyof typeof statusColors] || 'default'}>
                      {credit.status}
                    </Badge>
                  </dd>
                </div>
                {credit.courseId && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Course ID</dt>
                    <dd className="text-slate-900 dark:text-slate-50">{credit.courseId}</dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {credit.description && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Course Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{credit.description}</p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Certificate */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Certificate
              </h3>
              {credit.certificateUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-3">
                    <FileText className="h-8 w-8 text-slate-400" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-50">Certificate.pdf</p>
                      <p className="text-sm text-slate-500">Uploaded</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" icon={<Download className="h-4 w-4" />}>
                    Download Certificate
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No certificate uploaded</p>
                  <Button variant="outline" size="sm">Upload Certificate</Button>
                </div>
              )}
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
                  Request Verification
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Report to Bar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Duplicate Entry
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/cle">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to CLE Tracking
          </Button>
        </Link>
      </div>
    </>
  );
}
