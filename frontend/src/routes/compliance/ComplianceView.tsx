import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { AlertCircle, Calendar, Shield } from 'lucide-react';
import { useCompliance } from './ComplianceProvider';

export function ComplianceView() {
  const { checks, conflicts, deadlines, metrics } = useCompliance();

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Compliance" subtitle="Conflict checks and regulatory compliance" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Checks" value={metrics.totalChecks} icon={<Shield className="w-5 h-5 text-blue-600" />} />
        <MetricCard title="Pending Conflicts" value={metrics.pendingConflicts} icon={<AlertCircle className="w-5 h-5 text-rose-600" />} />
        <MetricCard title="Upcoming Deadlines" value={metrics.upcomingDeadlines} icon={<Calendar className="w-5 h-5 text-amber-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-auto">
        <Section title="Recent Checks">
          <div className="space-y-2">
            {checks.slice(0, 10).map(check => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>
        </Section>

        <Section title="Conflicts">
          <div className="space-y-2">
            {conflicts.map(conflict => (
              <ConflictRow key={conflict.id} conflict={conflict} />
            ))}
          </div>
        </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function CheckRow({ check }: { check: ComplianceCheck }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-white text-sm">{check.clientName}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{new Date(check.date).toLocaleDateString()}</div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${check.result === 'clear' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
          {check.result}
        </span>
      </div>
    </div>
  );
}

function ConflictRow({ conflict }: { conflict: ComplianceConflict }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 mt-1" />
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-white text-sm">{conflict.description}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{conflict.parties.join(', ')}</div>
        </div>
      </div>
    </div>
  );
}
