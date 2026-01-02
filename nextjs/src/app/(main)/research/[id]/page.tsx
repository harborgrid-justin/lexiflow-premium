/**
 * Research Detail Page - Server Component
 * Research session detail view
 */
import { Metadata } from 'next';

interface ResearchDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Research Session | LexiFlow',
  description: 'View research session details',
};

export default async function ResearchDetailPage({ params }: ResearchDetailPageProps) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Research Session: {id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">Research session details coming soon.</p>
      </div>
    </div>
  );
}
