/**
 * Practice Areas Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Practice Areas | LexiFlow',
  description: 'Manage law firm practice areas and specializations',
};

interface PracticeArea {
  id: string;
  name: string;
  description: string;
  caseCount: number;
  attorneyCount: number;
  activeStatus: 'Active' | 'Inactive';
}

async function PracticeAreasListContent() {
  let areas: PracticeArea[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.KNOWLEDGE?.ARTICLES || '/api/practice-areas');
    areas = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load practice areas';
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

  const columns = [
    { header: 'Practice Area', accessor: 'name' as const },
    { header: 'Description', accessor: 'description' as const },
    { header: 'Cases', accessor: 'caseCount' as const },
    { header: 'Attorneys', accessor: 'attorneyCount' as const },
    {
      header: 'Status',
      accessor: (row: PracticeArea) => (
        <Badge variant={row.activeStatus === 'Active' ? 'success' : 'default'}>
          {row.activeStatus}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {areas.length > 0 ? (
          <Table columns={columns} data={areas} />
        ) : (
          <EmptyState
            title="No practice areas found"
            description="Add your first practice area"
            action={<Button size="sm">Add Area</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function PracticeAreasPage() {
  return (
    <>
      <PageHeader
        title="Practice Areas"
        description="Manage legal practice areas and specialties"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Practice Areas' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>Add Area</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search practice areas..."
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
        <PracticeAreasListContent />
      </Suspense>
    </>
  );
}
