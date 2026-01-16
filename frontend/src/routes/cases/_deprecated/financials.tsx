/**
 * Case Financials Sub-Route
 */

import { billingApi, casesApi } from '@/lib/frontend-api';
import { CaseFinancialsCenter } from '@/routes/cases/components/financials/CaseFinancialsCenter';
import { Suspense } from 'react';
import { useLoaderData } from 'react-router';
import type { Route } from "./+types/financials";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.case?.title || "Case"} - Financials` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { caseId } = params;
  if (!caseId) throw new Response("Case ID is required", { status: 400 });

  const [caseResult, billingResult] = await Promise.all([
    casesApi.getCaseById(caseId),
    billingApi.getBillingByCaseId(caseId),
  ]);

  if (!caseResult.ok) throw new Response("Not Found", { status: 404 });

  const billing = billingResult.ok ? billingResult.data.data : [];

  return { case: caseResult.data, billing };
}

export default function CaseFinancialsRoute() {
  const { case: caseData } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <CaseFinancialsCenter caseId={caseData.id} />
    </Suspense>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div className="p-8 text-center text-red-600">Error: {error instanceof Error ? error.message : "Unknown"}</div>;
}
