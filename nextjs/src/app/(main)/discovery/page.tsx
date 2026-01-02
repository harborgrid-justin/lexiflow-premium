/**
 * Discovery Requests Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

interface DiscoveryRequest {
  id: string;
  caseNumber: string;
  requestType: string;
  sendDate: string;
  responseDate: string;
  status: 'Pending' | 'Received' | 'Objected';
}

async function DiscoveryList() {
  let requests: DiscoveryRequest[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.DISCOVERY_REQUESTS?.LIST || '/api/discovery-requests');
    requests = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load discovery requests';
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
    { header: 'Case', accessor: 'caseNumber' as const },
    { header: 'Type', accessor: 'requestType' as const },
    { header: 'Sent', accessor: 'sendDate' as const },
    { header: 'Response Due', accessor: 'responseDate' as const },
    {
      header: 'Status',
      accessor: (row: DiscoveryRequest) => (
        <Badge
          variant={
            row.status === 'Received'
              ? 'success'
              : row.status === 'Pending'
                ? 'warning'
                : 'danger'
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
        {requests.length > 0 ? (
          <Table columns={columns} data={requests} />
        ) : (
          <EmptyState
            title="No discovery requests found"
            description="Create your first discovery request"
            action={<Button size="sm">New Request</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function DiscoveryPage() {
  return (
    <>
      <PageHeader
        title="Discovery"
        description="Manage discovery requests and productions"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Discovery' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>New Request</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search discovery requests..."
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
        <DiscoveryList />
      </Suspense>
    </>
  );
}
