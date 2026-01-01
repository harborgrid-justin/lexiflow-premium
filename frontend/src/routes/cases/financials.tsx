/**
 * Case Financials Sub-Route
 */

import { CaseFinancialsCenter } from '@/features/cases/components/financials/CaseFinancialsCenter';
import { DataService } from '@/services/data/dataService';
import type { Route } from "./+types/financials";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.case?.title || "Case"} - Financials` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const caseData = await DataService.cases.get(caseId);
  if (!caseData) throw new Response("Not Found", { status: 404 });

  // Fetch billing data in parallel
  const billing = await DataService.billing.getByCaseId(caseId).catch(() => []);

  return { case: caseData, billing };
}

export default function CaseFinancialsRoute({ loaderData }: Route.ComponentProps) {
  return <CaseFinancialsCenter caseId={loaderData.case.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div className="p-8 text-center text-red-600">Error: {error instanceof Error ? error.message : "Unknown"}</div>;
}
