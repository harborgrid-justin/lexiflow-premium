import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Firm Iperations',
  description: 'Manage Firm Iperations',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Firm Iperations</h1>
      <p className="text-slate-600 dark:text-slate-400">Firm Iperations interface coming soon.</p>
    </div>
  );
}
