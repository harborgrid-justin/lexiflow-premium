/**
 * Case Calendar Sub-Route
 *
 * Displays calendar view for a specific case
 */

import { useLoaderData } from 'react-router';

import { casesApi } from '@/lib/frontend-api';
import { CaseCalendar } from '@/routes/cases/components/calendar/CaseCalendar';

import type { Route } from "./+types/calendar";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.case?.title || "Case"} - Calendar` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const result = await casesApi.getCaseById(caseId);
  if (!result.ok) throw new Response("Not Found", { status: 404 });

  return { case: result.data };
}

export default function CaseCalendarRoute() {
  const { case: caseData } = useLoaderData();
  return <CaseCalendar caseId={caseData.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="p-8 text-center text-red-600">
      Failed to load case calendar: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
