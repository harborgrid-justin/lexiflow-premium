/**
 * Case Operations Sub-Route
 */

import { CaseOperationsCenter } from '@/features/cases/components/operations/CaseOperationsCenter';
import { DataService } from '@/services/data/dataService';
import { useLoaderData } from 'react-router';
import type { Route } from "./+types/operations";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.case?.title || "Case"} - Operations` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const caseData = await DataService.cases.get(caseId);
  if (!caseData) throw new Response("Not Found", { status: 404 });
  return { case: caseData };
}

export default function CaseOperationsRoute() {
  const { case: caseData } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  return <CaseOperationsCenter caseId={caseData.id} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div className="p-8 text-center text-red-600">Error: {error instanceof Error ? error.message : "Unknown"}</div>;
}
