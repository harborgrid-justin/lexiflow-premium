/**
 * Docket Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docket',
  description: 'Manage court dockets and filings',
};

export default function DocketPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Docket</h1>
      <p className="text-slate-600 dark:text-slate-400">Docket management interface coming soon.</p>
    </div>
  );
}
