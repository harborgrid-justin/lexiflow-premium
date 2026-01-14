/**
 * Case Insights Sub-Route
 */

import { casesApi } from '@/lib/frontend-api';
import { CaseInsightsDashboard } from '@/routes/cases/components/insights/CaseInsightsDashboard';
import { useLoaderData } from 'react-router';
import type { Route } from "./+types/insights";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.case?.title || "Case"} - Insights` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const result = await casesApi.getCaseById(caseId);
  if (!result.ok) throw new Response("Not Found", { status: 404 });

  return { case: result.data };
}

export default function CaseInsightsRoute() {
  const { case: caseData } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  return <CaseInsightsDashboard caseId={caseData.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div className="p-8 text-center text-red-600">Error: {error instanceof Error ? error.message : "Unknown"}</div>;
}
