/**
 * Knowledge Base Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Knowledge Base | LexiFlow',
  description: 'Internal knowledge management and legal precedents',
};

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  createdDate: string;
  views: number;
}

async function KnowledgeListContent() {
  let articles: KnowledgeArticle[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.KNOWLEDGE?.ARTICLES || '/api/knowledge-base');
    articles = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load knowledge base';
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
    { header: 'Title', accessor: 'title' as const },
    { header: 'Category', accessor: 'category' as const },
    { header: 'Author', accessor: 'author' as const },
    { header: 'Created', accessor: 'createdDate' as const },
    { header: 'Views', accessor: 'views' as const },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {articles.length > 0 ? (
          <Table columns={columns} data={articles} />
        ) : (
          <EmptyState
            title="No articles found"
            description="Create the first knowledge base article"
            action={<Button size="sm">New Article</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function KnowledgeBasePage() {
  return (
    <>
      <PageHeader
        title="Knowledge Base"
        description="Company legal procedures and best practices"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Knowledge Base' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>New Article</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search knowledge base..."
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
        <KnowledgeListContent />
      </Suspense>
    </>
  );
}
