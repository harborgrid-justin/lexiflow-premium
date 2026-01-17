/**
 * Case Analytics Sub-Route
 *
 * Displays analytics dashboard for a specific case
 */

import { useLoaderData } from 'react-router';

import { analyticsApi, casesApi } from '@/lib/frontend-api';
import { CaseAnalyticsDashboard } from '@/routes/cases/components/analytics/CaseAnalyticsDashboard';

import type { Route } from "./+types/analytics";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.case?.title || "Case"} - Analytics` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const [caseResult, analyticsResult] = await Promise.all([
    casesApi.getCaseById(caseId),
    analyticsApi.getCaseAnalytics(caseId),
  ]);

  if (!caseResult.ok) throw new Response("Not Found", { status: 404 });

  const analytics = analyticsResult.ok ? analyticsResult.data : null;

  return { case: caseResult.data, analytics };
}

export default function CaseAnalyticsRoute() {
  const { case: caseData } = useLoaderData();
  return <CaseAnalyticsDashboard caseId={caseData.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="p-8 text-center text-red-600">
      Failed to load case analytics: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
