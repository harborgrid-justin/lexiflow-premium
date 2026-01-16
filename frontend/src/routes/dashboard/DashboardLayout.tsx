import { PageFrame } from "@/layouts/PageFrame";
import { Suspense } from "react";
import { Await, Outlet, useLoaderData, useRevalidator } from "react-router";
import { RouteSkeleton } from "../_shared/RouteSkeletons";
import {
  DashboardRecentDocket,
  DashboardRecentTime,
  DeferredDataError,
  DeferredDataSkeleton
} from "./components/RecentActivityWidgets";
import { DashboardProvider } from "./DashboardProvider";
import { loader } from "./loader";

export { loader };

export default function DashboardLayout() {
  const data = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  if (!data) {
    return <RouteSkeleton title="Loading Dashboard..." />;
  }

  return (
    <PageFrame
      title="Command Center"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <DashboardProvider
        initialCases={data.cases}
        initialTasks={data.tasks}
        onRevalidate={revalidator.revalidate}
      >
        <div className="space-y-6">
          <Outlet context={{
            recentDocketEntries: data.recentDocketEntries,
            recentTimeEntries: data.recentTimeEntries
          }} />

          {/* Deferred data sections with nested Suspense */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            <Suspense fallback={<DeferredDataSkeleton title="Recent Docket" />}>
              <Await resolve={data.recentDocketEntries} errorElement={<DeferredDataError />}>
                {(docketEntries) => (
                  <DashboardRecentDocket entries={docketEntries as any} />
                )}
              </Await>
            </Suspense>

            <Suspense fallback={<DeferredDataSkeleton title="Recent Time" />}>
              <Await resolve={data.recentTimeEntries} errorElement={<DeferredDataError />}>
                {(timeEntries) => (
                  <DashboardRecentTime entries={timeEntries as any} />
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </DashboardProvider>
    </PageFrame>
  );
}
