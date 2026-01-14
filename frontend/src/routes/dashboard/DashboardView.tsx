import { Briefcase, Calendar, CheckSquare, Clock, Gavel } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '../../components/common/PageHeader';
import { useDashboard } from './DashboardProvider';

/**
 * DashboardView - Pure Presentation Layer
 */
export function DashboardView() {
  const { metrics, cases, docketEntries, tasks } = useDashboard();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your legal practice"
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="Total Cases"
          value={metrics.totalCases}
          subtitle={`${metrics.activeCases} active`}
          icon={<Briefcase className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Deadlines"
          value={metrics.upcomingDeadlines}
          subtitle="Next 7 days"
          icon={<Calendar className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Pending Tasks"
          value={metrics.pendingTasks}
          subtitle="Requires action"
          icon={<CheckSquare className="w-5 h-5 text-purple-600" />}
        />
        <MetricCard
          title="Week Hours"
          value={metrics.weekHours.toFixed(1)}
          subtitle="Billable time"
          icon={<Clock className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Today's Filings"
          value={metrics.todayDocketEntries}
          subtitle="Docket entries"
          icon={<Gavel className="w-5 h-5 text-rose-600" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-auto">
        {/* Active Cases */}
        <DashboardSection title="Active Cases" linkTo="/cases">
          <div className="space-y-2">
            {cases.filter(c => c.status === 'Active').slice(0, 5).map(caseItem => (
              <Link
                key={caseItem.id}
                to={`/cases/${caseItem.id}`}
                className="block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-blue-500 transition-colors"
              >
                <div className="font-medium text-slate-900 dark:text-white">
                  {caseItem.title}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {caseItem.caseNumber} • {caseItem.type || caseItem.matterType}
                </div>
              </Link>
            ))}
          </div>
        </DashboardSection>

        {/* Recent Docket Entries */}
        <DashboardSection title="Recent Docket Entries" linkTo="/docket">
          <div className="space-y-2">
            {docketEntries.slice(0, 5).map(entry => (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
              >
                <div className="font-medium text-slate-900 dark:text-white text-sm">
                  {entry.description}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(entry.entryDate).toLocaleDateString()} • Entry #{entry.docketNumber || entry.id}
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        {/* Pending Tasks */}
        <DashboardSection title="Pending Tasks" linkTo="/workflow">
          <div className="space-y-2">
            {tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').slice(0, 5).map(task => (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
              >
                <div className="font-medium text-slate-900 dark:text-white text-sm">
                  {task.title}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'} • Priority: {task.priority}
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        {/* Case Distribution */}
        <DashboardSection title="Case Distribution">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                By Status
              </div>
              {Object.entries(metrics.casesByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{status}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                By Type
              </div>
              {Object.entries(metrics.casesByType).slice(0, 5).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{type}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon }: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

function DashboardSection({ title, linkTo, children }: {
  title: string;
  linkTo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View all →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
