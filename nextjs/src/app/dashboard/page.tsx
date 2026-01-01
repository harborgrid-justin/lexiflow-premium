import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'LexiFlow Dashboard - Overview of your legal practice',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Welcome to your LexiFlow dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats cards */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Cases
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              24
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending Tasks
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              12
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Documents
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              1,234
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Hours Logged
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              156.5
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Recent Activity
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Coming soon: Recent cases, documents, and tasks will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
