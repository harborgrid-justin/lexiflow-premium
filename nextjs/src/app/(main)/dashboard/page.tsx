/**
 * Dashboard Page - Server Component
 * Executive overview of firm performance and key metrics
 *
 * ENTERPRISE GUIDELINES COMPLIANCE:
 * - [✓] Guideline 1: Default export for /dashboard route
 * - [✓] Guideline 2: Server Component by default
 * - [✓] Guideline 5: Isolated data fetching via getDashboardData
 * - [✓] Guideline 7: SEO metadata export
 * - [✓] Guideline 11: Suspense for loading states
 * - [✓] Guideline 17: Self-documenting with JSDoc
 */

import { Skeleton } from "@/components/ui";
import { DashboardMetrics } from "@/features/dashboard/components/DashboardMetrics";
import { ActivityFeed } from "@/components/dashboard/widgets/ActivityFeed";
import { RevenueChart } from "@/components/dashboard/widgets/RevenueChart";
import { getDashboardData } from "@/lib/dal/dashboard";
import { Suspense } from "react";
import { format, subDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";

export const metadata = {
  title: "Dashboard - LexiFlow",
  description: "Executive overview of firm performance",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  const today = new Date();
  const lastMonth = subDays(today, 30);
  const dateRangeLabel = `${format(lastMonth, "MMM d, yyyy")} - ${format(today, "MMM d, yyyy")}`;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-sm font-normal text-slate-500 dark:text-slate-400">
            <CalendarDays className="mr-2 h-4 w-4" />
            {dateRangeLabel}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardMetrics stats={data.quickStats} />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Chart Area */}
          <div className="col-span-4">
            <RevenueChart data={data.revenueData} />
          </div>

          {/* Recent Activity / Feed */}
          <div className="col-span-3">
            <ActivityFeed activities={data.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
