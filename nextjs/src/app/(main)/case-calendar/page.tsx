import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Aalendar',
  description: 'Manage Case Aalendar',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Case Aalendar</h1>
      <p className="text-slate-600 dark:text-slate-400">Case Aalendar interface coming soon.</p>
    </div>
  );
}
