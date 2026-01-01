import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clauses',
  description: 'Manage Clauses',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Clauses</h1>
      <p className="text-slate-600 dark:text-slate-400">Clauses interface coming soon.</p>
    </div>
  );
}
