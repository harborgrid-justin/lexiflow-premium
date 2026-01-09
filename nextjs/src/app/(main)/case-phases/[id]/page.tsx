/**
 * Case Phase Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowLeft, Calendar, CheckCircle2, Circle, Edit, Trash2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CasePhaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CasePhaseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const phase = await apiFetch(`/case-phases/${id}`);
    return {
      title: `${phase.phaseName} | Case Phases | LexiFlow`,
      description: `Phase details for ${phase.phaseName}`,
    };
  } catch {
    return { title: 'Phase Not Found' };
  }
}

export default async function CasePhaseDetailPage({ params }: CasePhaseDetailPageProps) {
  const { id } = await params;

  let phase;
  try {
    phase = await apiFetch(`/case-phases/${id}`);
  } catch {
    notFound();
  }

  const statusColors = {
    not_started: 'default',
    in_progress: 'info',
    completed: 'success',
    on_hold: 'warning',
  } as const;

  const statusLabels = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    on_hold: 'On Hold',
  };

  const progress = phase.totalTasks > 0 ? (phase.completedTasks / phase.totalTasks) * 100 : 0;

  // Fetch tasks from API
  let tasks = [];
  try {
    tasks = await apiFetch(`/case-phases/${id}/tasks`) || [];
  } catch {
    tasks = phase.tasks || [];
  }

  const taskColumns = [
    {
      header: 'Task',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.status === 'completed' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-slate-300" />
          )}
          <span className={row.status === 'completed' ? 'line-through text-slate-500' : ''}>
            {row.title}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Badge variant={row.status === 'completed' ? 'success' : row.status === 'in_progress' ? 'info' : 'default'}>
          {row.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </Badge>
      ),
    },
    { header: 'Assignee', accessor: 'assignee' as const },
    {
      header: 'Due Date',
      accessor: (row: any) => new Date(row.dueDate).toLocaleDateString(),
    },
  ];

  return (
    <>
      <PageHeader
        title={phase.phaseName}
        description={phase.caseName || `Case: ${phase.caseId}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: 'Phases', href: '/case-phases' },
          { label: phase.phaseName },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase Details */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Phase Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Phase Name</dt>
                  <dd className="text-slate-900 dark:text-slate-50 font-medium">{phase.phaseName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <Badge variant={statusColors[phase.status as keyof typeof statusColors] || 'default'}>
                      {statusLabels[phase.status as keyof typeof statusLabels]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Case</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {phase.caseName || phase.caseId}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Start Date</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {phase.startDate ? new Date(phase.startDate).toLocaleDateString() : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Due Date</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {phase.dueDate ? new Date(phase.dueDate).toLocaleDateString() : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">End Date</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : 'In progress'}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Progress */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Progress
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span>Tasks Completed</span>
                  <span>{phase.completedTasks} / {phase.totalTasks}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">{progress.toFixed(0)}% complete</p>
              </div>
            </CardBody>
          </Card>

          {/* Tasks */}
          <Card>
            <CardBody className="p-0">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Tasks
                </h3>
                <Button size="sm">Add Task</Button>
              </div>
              <Table columns={taskColumns} data={tasks} />
            </CardBody>
          </Card>

          {/* Description */}
          {phase.description && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {phase.description}
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Mark as Complete
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Add Milestone
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View Case
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Timeline
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Phase Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Phase Started</p>
                    <p className="text-xs text-slate-500">{phase.startDate ? new Date(phase.startDate).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Current</p>
                    <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-slate-300" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Due Date</p>
                    <p className="text-xs text-slate-500">{phase.dueDate ? new Date(phase.dueDate).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/case-phases">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Case Phases
          </Button>
        </Link>
      </div>
    </>
  );
}
