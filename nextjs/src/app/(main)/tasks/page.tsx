/**
 * Tasks Management Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-config';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Completed';
}

async function TasksList() {
  let tasks: Task[] = [];
  let error = null;

  try {
    const response = await apiFetch('/api/tasks');
    tasks = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load tasks';
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
    { header: 'Task', accessor: 'title' as const },
    { header: 'Assignee', accessor: 'assignee' as const },
    { header: 'Due Date', accessor: 'dueDate' as const },
    {
      header: 'Priority',
      accessor: (row: Task) => (
        <Badge
          variant={
            row.priority === 'High' ? 'danger' : row.priority === 'Medium' ? 'warning' : 'default'
          }
        >
          {row.priority}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Task) => (
        <Badge
          variant={
            row.status === 'Completed'
              ? 'success'
              : row.status === 'In Progress'
                ? 'primary'
                : 'default'
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {tasks.length > 0 ? (
          <Table columns={columns} data={tasks} />
        ) : (
          <EmptyState
            title="No tasks found"
            description="Create your first task"
            action={<Button size="sm">New Task</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Manage team tasks and assignments"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>New Task</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search tasks..."
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
        <TasksList />
      </Suspense>
    </>
  );
}
