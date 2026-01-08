/**
 * Client Analytics Loading State
 */

import { ClientAnalyticsSkeleton } from './ClientAnalyticsSkeleton';

export default function ClientAnalyticsLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 sm:p-6 lg:p-8">
      <ClientAnalyticsSkeleton />
    </div>
  );
}
