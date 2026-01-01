/**
 * Correspondence Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Correspondence',
  description: 'Manage legal correspondence',
};

export default function CorrespondencePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Correspondence</h1>
      <p className="text-slate-600 dark:text-slate-400">Correspondence management interface coming soon.</p>
    </div>
  );
}
