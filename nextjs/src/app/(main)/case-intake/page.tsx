import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Antake',
  description: 'Manage Case Antake',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Case Antake</h1>
      <p className="text-slate-600 dark:text-slate-400">Case Antake interface coming soon.</p>
    </div>
  );
}
