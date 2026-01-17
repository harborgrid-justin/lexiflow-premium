import { FileText, Grid, List } from 'lucide-react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';

import { useDocuments } from './DocumentsProvider';

export function DocumentsView() {
  const { documents, metrics, activeView, setActiveView } = useDocuments();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Documents"
        subtitle="Legal document repository"
        actions={
          <div className="flex items-center gap-2">
            <Button variant={activeView === 'grid' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveView('grid')}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={activeView === 'list' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveView('list')}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="md">
              <FileText className="w-4 h-4" />
              Upload
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total" value={metrics.total} />
        <MetricCard title="Pleadings" value={metrics.pleadings} />
        <MetricCard title="Evidence" value={metrics.evidence} />
        <MetricCard title="Correspondence" value={metrics.correspondence} />
      </div>

      <div className="flex-1 overflow-auto">
        {activeView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <DocumentRow key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function DocumentCard({ document }: { document: Document }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4 hover:border-blue-500 transition-colors cursor-pointer">
      <FileText className="w-8 h-8 text-blue-600 mb-2" />
      <div className="font-medium text-slate-900 dark:text-white text-sm mb-1">{document.title}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400">{document.category}</div>
    </div>
  );
}

function DocumentRow({ document }: { document: Document }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4 flex items-center justify-between hover:border-blue-500 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{document.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{document.category}</div>
        </div>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {new Date(document.uploadedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
