/**
 * Reports Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Reports | LexiFlow',
  description: 'Generate and manage custom reports and analytics',
};

interface Report {
  id: string;
  name: string;
  type: string;
  createdDate: string;
  createdBy: string;
  format: 'PDF' | 'Excel' | 'Word';
}

async function ReportsListContent() {
  let reports: Report[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.REPORTS?.LIST || '/api/reports');
    reports = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load reports';
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
    { header: 'Report Name', accessor: 'name' as const },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Created By', accessor: 'createdBy' as const },
    { header: 'Created Date', accessor: 'createdDate' as const },
    {
      header: 'Format',
      accessor: (row: Report) => (
        <Badge
          variant={
            row.format === 'PDF'
              ? 'danger'
              : row.format === 'Excel'
                ? 'success'
                : 'primary'
          }
        >
          {row.format}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {reports.length > 0 ? (
          <Table columns={columns} data={reports} />
        ) : (
          <EmptyState
            title="No reports found"
            description="Generate your first report"
            action={<Button size="sm">Generate Report</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate and manage legal reports"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>Generate Report</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search reports..."
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
        <ReportsListContent />
      </Suspense>
    </>
  );
}
