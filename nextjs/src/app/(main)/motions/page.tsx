/**
 * Motions Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Motions | LexiFlow',
  description: 'Track and manage legal motions and court filings',
};

interface Motion {
  id: string;
  title: string;
  type: string;
  caseId: string;
  filedDate: string;
  status: 'Draft' | 'Filed' | 'Heard' | 'Granted' | 'Denied';
}

async function MotionsListContent() {
  let motions: Motion[] = [];
  let error = null;
  let isAuthError = false;

  try {
    const response = await apiFetch(API_ENDPOINTS.MOTIONS?.LIST || '/api/motions');
    motions = Array.isArray(response) ? response : [];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load motions';
    // Check if this is an authentication error
    isAuthError = errorMessage.includes('401') || errorMessage.includes('Unauthorized');
    error = errorMessage;
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          {isAuthError ? (
            <EmptyState
              title="Authentication Required"
              description="Please log in to view motions"
              action={
                <Link href="/login">
                  <Button variant="primary">
                    Go to Login
                  </Button>
                </Link>
              }
            />
          ) : (
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          )}
        </CardBody>
      </Card>
    );
  }

  const columns = [
    { header: 'Title', accessor: 'title' as const },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Case', accessor: 'caseId' as const },
    { header: 'Filed Date', accessor: 'filedDate' as const },
    {
      header: 'Status',
      accessor: (row: Motion) => (
        <Badge
          variant={
            row.status === 'Granted'
              ? 'success'
              : row.status === 'Denied'
                ? 'danger'
                : row.status === 'Filed'
                  ? 'primary'
                  : 'default'
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {motions.length > 0 ? (
          <Table columns={columns} data={motions} />
        ) : (
          <EmptyState
            title="No motions found"
            description="File your first motion"
            action={<Button size="sm">File Motion</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function MotionsPage() {
  return (
    <>
      <PageHeader
        title="Motions"
        description="Draft, file, and track legal motions"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Motions' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>File Motion</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search motions..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
          />
        </CardBody>
      </Card>

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
        <MotionsListContent />
      </Suspense>
    </>
  );
}
