/**
 * Legal Research Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Legal Research | LexiFlow',
  description: 'Case law research, statutes, and legal analysis',
};

interface Research {
  id: string;
  topic: string;
  jurisdiction: string;
  type: 'Case Law' | 'Statute' | 'Regulation' | 'Article';
  relevance: 'High' | 'Medium' | 'Low';
  savedDate: string;
}

async function ResearchList() {
  let research: Research[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.KNOWLEDGE?.ARTICLES || '/api/research');
    research = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load research';
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
    { header: 'Topic', accessor: 'topic' as const },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Jurisdiction', accessor: 'jurisdiction' as const },
    {
      header: 'Relevance',
      accessor: (row: Research) => (
        <Badge
          variant={
            row.relevance === 'High' ? 'success' : row.relevance === 'Medium' ? 'warning' : 'default'
          }
        >
          {row.relevance}
        </Badge>
      ),
    },
    { header: 'Saved Date', accessor: 'savedDate' as const },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {research.length > 0 ? (
          <Table columns={columns} data={research} />
        ) : (
          <EmptyState
            title="No research saved"
            description="Search and save legal research materials"
            action={<Button size="sm">New Research</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function LegalResearchPage() {
  return (
    <>
      <PageHeader
        title="Legal Research"
        description="Search and manage legal research materials"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Research' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>Save Research</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search case law, statutes, regulations..."
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
        <ResearchList />
      </Suspense>
    </>
  );
}
