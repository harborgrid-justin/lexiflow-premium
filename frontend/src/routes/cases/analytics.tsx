/**
 * Case Analytics Sub-Route
 *
 * Displays analytics dashboard for a specific case
 */

import { CaseAnalyticsDashboard } from '@/routes/cases/components/analytics/CaseAnalyticsDashboard';
import { DataService } from '@/services/data/dataService';
import { useLoaderData } from 'react-router';
import type { Route } from "./+types/analytics";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.case?.title || "Case"} - Analytics` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const caseData = await DataService.cases.get(caseId);
  if (!caseData) throw new Response("Not Found", { status: 404 });

  // Pre-fetch analytics data
  const analytics = await DataService.analytics.getCaseMetrics(caseId).catch(() => null);

  return { case: caseData, analytics };
}

export default function CaseAnalyticsRoute() {
  const { case: caseData } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  return <CaseAnalyticsDashboard caseId={caseData.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="p-8 text-center text-red-600">
      Failed to load case analytics: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
