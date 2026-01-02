/**
 * Workflows Page - Server Component
 */
import MasterWorkflow from '@/components/workflows/MasterWorkflow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workflows | LexiFlow',
  description: 'Manage legal workflows and tasks',
};

export default function WorkflowsPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <MasterWorkflow />
    </div>
  );
}
