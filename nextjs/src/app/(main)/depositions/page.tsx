/**
 * Depositions Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

interface Deposition {
  id: string;
  witness: string;
  caseId: string;
  scheduledDate: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled';
}

async function DepositionsList() {
  let depositions: Deposition[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.DEPOSITIONS?.LIST || '/api/depositions');
    depositions = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load depositions';
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
    { header: 'Witness', accessor: 'witness' as const },
    { header: 'Case', accessor: 'caseId' as const },
    { header: 'Scheduled Date', accessor: 'scheduledDate' as const },
    { header: 'Location', accessor: 'location' as const },
    {
      header: 'Status',
      accessor: (row: Deposition) => (
        <Badge
          variant={
            row.status === 'Completed'
              ? 'success'
              : row.status === 'Scheduled'
                ? 'primary'
                : 'warning'
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
        {depositions.length > 0 ? (
          <Table columns={columns} data={depositions} />
        ) : (
          <EmptyState
            title="No depositions found"
            description="Schedule your first deposition"
            action={<Button size="sm">Schedule Deposition</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function DepositionsPage() {
  return (
    <>
      <PageHeader
        title="Depositions"
        description="Manage deposition scheduling and transcripts"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Depositions' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>Schedule Deposition</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search depositions..."
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
        <DepositionsList />
      </Suspense>
    </>
  );
}
