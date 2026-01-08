/**
 * Billing Analytics Loading State
 */

import { BillingAnalyticsSkeleton } from './BillingAnalyticsSkeleton';

export default function BillingAnalyticsLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 sm:p-6 lg:p-8">
      <BillingAnalyticsSkeleton />
    </div>
  );
}
