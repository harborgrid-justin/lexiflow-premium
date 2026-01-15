import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import type { DiscoveryRequest } from '@/types';
import { CheckCircle, FileText, Tag } from 'lucide-react';
import { useDiscovery } from './DiscoveryProvider';

type Evidence = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  reviewStatus?: string;
};

export function DiscoveryView() {
  const { evidence, requests, productions, metrics, activeTab, setActiveTab, isPending } = useDiscovery();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Discovery"
        subtitle="Evidence management and production"
        actions={
          <Button variant="primary" size="md">
            <FileText className="w-4 h-4" />
            Add Evidence
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard title="Total Evidence" value={metrics.totalEvidence} icon={<FileText className="w-5 h-5 text-blue-600" />} />
        <MetricCard title="Tagged" value={metrics.taggedEvidence} icon={<Tag className="w-5 h-5 text-purple-600" />} />
        <MetricCard title="Reviewed" value={metrics.reviewedEvidence} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} />
        <MetricCard title="Pending Requests" value={metrics.pendingRequests} icon={<FileText className="w-5 h-5 text-amber-600" />} />
        <MetricCard title="Productions" value={metrics.completedProductions} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
        <nav className="flex space-x-4">
          <TabButton active={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')} disabled={isPending}>
            Evidence ({evidence.length})
          </TabButton>
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} disabled={isPending}>
            Requests ({requests.length})
          </TabButton>
          <TabButton active={activeTab === 'productions'} onClick={() => setActiveTab('productions')} disabled={isPending}>
            Productions ({productions.length})
          </TabButton>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'evidence' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidence.map(item => (
              <EvidenceCard key={item.id} evidence={item} />
            ))}
          </div>
        )}
        {activeTab === 'requests' && (
          <div className="space-y-2">
            {requests.map(req => (
              <RequestRow key={req.id} request={req} />
            ))}
          </div>
        )}
        {activeTab === 'productions' && (
          <div className="space-y-2">
            {productions.map(prod => (
              <ProductionRow key={prod.id} production={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, disabled, children }: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
    >
      {children}
    </button>
  );
}

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="font-medium text-slate-900 dark:text-white mb-2">{evidence.title}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">{evidence.description}</div>
      <div className="flex flex-wrap gap-2">
        {evidence.tags?.map((tag: string) => (
          <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function RequestRow({ request }: { request: DiscoveryRequest }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{request.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Due: {new Date(request.dueDate).toLocaleDateString()}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
          {request.status}
        </span>
      </div>
    </div>
  );
}

function ProductionRow({ production }: { production: ProductionSet }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{production.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{production.docCount} documents</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${production.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
          {production.status}
        </span>
      </div>
    </div>
  );
}
