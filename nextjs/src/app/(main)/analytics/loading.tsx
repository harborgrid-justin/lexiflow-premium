/**
 * Analytics Loading State
 * Displays skeleton UI while analytics data is loading
 *
 * Next.js 16 file convention for loading states
 */

import { AnalyticsDashboardSkeleton } from './AnalyticsDashboardSkeleton';

export default function AnalyticsLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 sm:p-6 lg:p-8">
      <AnalyticsDashboardSkeleton />
    </div>
  );
}
