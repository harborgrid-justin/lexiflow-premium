/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { casesApi, documentsApi } from "@/lib/frontend-api";
import type { Route } from "./+types/case-detail";

/**
 * Case Detail Loader - Server-side Data Fetching with Streaming
 *
 * Pattern:
 * 1. Await critical data immediately (case data - required for render)
 * 2. Return promises for non-critical data (documents, parties - can load later)
 *
 * This enables the page to render quickly with essential data
 * while additional data streams in progressively
 */
export async function caseDetailLoader({ params }: Route.ClientLoaderArgs) {
  const { caseId } = params;

  if (!caseId) {
    throw new Response("Case ID is required", { status: 400 });
  }

  // Critical data - await immediately (blocks render)
  let caseResult;
  try {
    caseResult = await casesApi.getCaseById(caseId);
  } catch {
    caseResult = { ok: false } as const;
  }

  // 404 handling - case doesn't exist
  if (!caseResult.ok) {
    throw new Response("Case Not Found", {
      status: 404,
      statusText: "The requested case does not exist",
    });
  }

  const caseData = caseResult.data;

  // Non-critical data - return as promises for streaming
  // These load in parallel and render when ready via Suspense
  const documentsPromise = documentsApi
    .getDocumentsByCase(caseId)
    .then((r) => (r.ok ? r.data.data : []));
  const partiesPromise = casesApi
    .getCaseParties(caseId)
    .then((r) => (r.ok ? r.data.data : []));

  return {
    caseData,
    // Return promises - Await component will handle resolution
    documents: documentsPromise,
    parties: partiesPromise,
  };
}

// Force client-side execution for hydration (needed for localStorage auth)
(caseDetailLoader as any).hydrate = true;
