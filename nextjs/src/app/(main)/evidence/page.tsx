/**
 * Evidence Management Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Evidence Management | LexiFlow',
  description: 'Chain of custody tracking and evidence management for litigation',
};

interface Evidence {
  id: string;
  description: string;
  type: string;
  caseId: string;
  custodian: string;
  status: 'Collected' | 'Processing' | 'Verified';
}

async function EvidenceList() {
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?from=/evidence&error=unauthorized');
  }

  let items: Evidence[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.EVIDENCE?.LIST || '/api/evidence');
    items = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load evidence';

    // If unauthorized, redirect to login
    if (error.includes('401') || error.includes('Unauthorized')) {
      redirect('/login?from=/evidence&error=session');
    }
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            <Link
              href="/login?from=/evidence"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in to continue
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  const columns = [
    { header: 'Description', accessor: 'description' as const },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Case ID', accessor: 'caseId' as const },
    { header: 'Custodian', accessor: 'custodian' as const },
    {
      header: 'Status',
      accessor: (row: Evidence) => (
        <Badge
          variant={
            row.status === 'Verified'
              ? 'success'
              : row.status === 'Processing'
                ? 'warning'
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
        {items.length > 0 ? (
          <Table columns={columns} data={items} />
        ) : (
          <EmptyState
            title="No evidence found"
            description="Log your first evidence"
            action={<Button size="sm">Log Evidence</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function EvidencePage() {
  return (
    <>
      <PageHeader
        title="Evidence"
        description="Track and manage case evidence"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Evidence' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>Log Evidence</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search evidence..."
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
        <EvidenceList />
      </Suspense>
    </>
  );
}
