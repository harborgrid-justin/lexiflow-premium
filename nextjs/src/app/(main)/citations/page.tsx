/**
 * Citations Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citations',
  description: 'Manage legal citations',
};

export default function CitationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Citations</h1>
      <p className="text-slate-600 dark:text-slate-400">Citations management interface coming soon.</p>
    </div>
  );
}
