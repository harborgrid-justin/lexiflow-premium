/**
 * Case Phases Page - Case Lifecycle Management
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowRight, Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Phases | LexiFlow',
  description: 'Manage case lifecycle phases and milestones',
};

interface CasePhase {
  id: string;
  caseId: string;
  caseName?: string;
  phaseName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  description?: string;
  completedTasks: number;
  totalTasks: number;
}

async function CasePhasesList() {
  let phases: CasePhase[] = [];
  let error = null;

  try {
    const response = await apiFetch('/case-phases');
    phases = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load case phases';
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

  const columns = [
    {
      header: 'Phase',
      accessor: (row: CasePhase) => (
        <Link href={`/case-phases/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          {row.phaseName}
        </Link>
      ),
    },
    {
      header: 'Case',
      accessor: (row: CasePhase) => row.caseName || row.caseId,
    },
    {
      header: 'Status',
      accessor: (row: CasePhase) => (
        <Badge variant={statusColors[row.status]}>
          {statusLabels[row.status]}
        </Badge>
      ),
    },
    {
      header: 'Progress',
      accessor: (row: CasePhase) => {
        const progress = row.totalTasks > 0 ? (row.completedTasks / row.totalTasks) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {row.completedTasks}/{row.totalTasks}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Start Date',
      accessor: (row: CasePhase) => row.startDate ? new Date(row.startDate).toLocaleDateString() : '-',
    },
    {
      header: 'Due Date',
      accessor: (row: CasePhase) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-',
    },
    {
      header: 'Actions',
      accessor: (row: CasePhase) => (
        <Link href={`/case-phases/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {phases.length > 0 ? (
          <Table columns={columns} data={phases} />
        ) : (
          <EmptyState
            title="No case phases found"
            description="Add phase tracking to your cases"
            action={
              <Link href="/case-phases/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add Phase
                </Button>
              </Link>
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function CasePhasesPage() {
  return (
    <>
      <PageHeader
        title="Case Phases"
        description="Track case lifecycle phases and milestones"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: 'Phases' },
        ]}
        actions={
          <Link href="/case-phases/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add Phase</Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Clock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Not Started</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">8</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <ArrowRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">12</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">45</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Due This Week</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">3</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              placeholder="Search phases..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
            <div className="flex gap-2">
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Cases</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Phases Table */}
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
        <CasePhasesList />
      </Suspense>
    </>
  );
}
