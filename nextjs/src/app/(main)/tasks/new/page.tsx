import { PageHeader } from '@/components/layout/PageHeader';
import { NewTaskForm } from '@/components/tasks/NewTaskForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Task | Tasks | LexiFlow',
  description: 'Create a new task assignment',
};

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Task"
        description="Assign a new task to a team member or yourself."
        breadcrumbs={[
          { label: 'Tasks', href: '/tasks' },
          { label: 'New Task' } // No href implies active/current page
        ]}
      />
      <NewTaskForm />
    </div>
  );
}
