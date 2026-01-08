/**
 * Compliance Tracking Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Compliance | LexiFlow',
  description: 'Monitor ethics, conflicts, and regulatory compliance',
};

interface ComplianceItem {
  id: string;
  requirement: string;
  jurisdiction: string;
  dueDate: string;
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
  lastChecked: string;
}

async function ComplianceListContent() {
  let items: ComplianceItem[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.CONFLICT_CHECKS?.LIST || '/api/compliance');
    items = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load compliance items';
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
    { header: 'Requirement', accessor: 'requirement' as const },
    { header: 'Jurisdiction', accessor: 'jurisdiction' as const },
    { header: 'Due Date', accessor: 'dueDate' as const },
    {
      header: 'Status',
      accessor: (row: ComplianceItem) => (
        <Badge
          variant={
            row.status === 'Compliant'
              ? 'success'
              : row.status === 'At Risk'
                ? 'warning'
                : 'danger'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    { header: 'Last Checked', accessor: 'lastChecked' as const },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {items.length > 0 ? (
          <Table columns={columns} data={items} />
        ) : (
          <EmptyState
            title="No compliance items found"
            description="Add compliance requirements to track"
            action={<Button size="sm">New Requirement</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function CompliancePage() {
  return (
    <>
      <PageHeader
        title="Compliance Tracking"
        description="Monitor regulatory compliance and requirements"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Compliance' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>New Requirement</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search compliance items..."
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
        <ComplianceListContent />
      </Suspense>
    </>
  );
}
