/**
 * Case Calendar Sub-Route
 *
 * Displays calendar view for a specific case
 */

import { CaseCalendar } from '@/features/cases/components/calendar/CaseCalendar';
import { DataService } from '@/services/data/dataService';
import type { Route } from "./+types/calendar";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.case?.title || "Case"} - Calendar` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const caseData = await DataService.cases.get(caseId);
  if (!caseData) throw new Response("Not Found", { status: 404 });

  return { case: caseData };
}

export default function CaseCalendarRoute() {
  return <CaseCalendar caseId={loaderData.case.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="p-8 text-center text-red-600">
      Failed to load case calendar: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
