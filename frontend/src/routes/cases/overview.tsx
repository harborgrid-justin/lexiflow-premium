/**
 * Case Overview Sub-Route
 *
 * Displays overview dashboard for a specific case
 *
 * Enterprise API Pattern:
 * - Uses @/lib/frontend-api/cases for data fetching
 * - Handles Result<T> returns with .ok checks
 * - Throws on error for proper error boundary handling
 */

import { useLoaderData } from 'react-router';

import { CaseOverviewDashboard } from '@/routes/cases/components/overview/CaseOverviewDashboard';

import type { Route } from "./+types/overview";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.case?.title || "Case"} - Overview` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  // Fetch case using new enterprise API
  const result = await casesApi.getCaseById(caseId);

  if (!result.ok) {
    throw new Response("Case Not Found", { status: 404 });
  }

  return { case: result.data };
}

export default function CaseOverviewRoute() {
  const { case: caseData } = useLoaderData();
  return <CaseOverviewDashboard caseId={caseData.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="p-8 text-center text-red-600">
      Failed to load case overview: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
