/**
 * Case Analytics Loading State
 * Displays skeleton UI while case analytics data is loading
 */

import { CaseAnalyticsSkeleton } from './CaseAnalyticsSkeleton';

export default function CaseAnalyticsLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 sm:p-6 lg:p-8">
      <CaseAnalyticsSkeleton />
    </div>
  );
}
