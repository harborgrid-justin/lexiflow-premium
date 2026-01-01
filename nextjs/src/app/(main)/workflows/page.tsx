/**
 * Workflows Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workflows',
  description: 'Manage legal workflows and tasks',
};

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Workflows</h1>
      <p className="text-slate-600 dark:text-slate-400">Workflow management interface coming soon.</p>
    </div>
  );
}
