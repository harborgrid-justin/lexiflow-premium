/**
 * Evidence Detail Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evidence Detail',
  description: 'View evidence details',
};

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Evidence {id}</h1>
      <p className="text-slate-600 dark:text-slate-400">Evidence detail interface coming soon.</p>
    </div>
  );
}
