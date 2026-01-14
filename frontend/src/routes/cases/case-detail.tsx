/**
 * Case Detail Route - Enhanced with React Router v7 Features
 *
 * Displays detailed information for a single case with:
 * - Streaming data with Suspense/Await for non-critical data
 * - Type-safe params via Route types
 * - Error boundary with 404 handling
 * - Dynamic meta tags based on case data
 * - Parallel data fetching
 * - Progressive form actions
 *
 * React Router v7 Best Practices:
 * - Critical data awaited immediately in loader
 * - Non-critical data returned as promises for streaming
 * - Proper Suspense boundaries with meaningful fallbacks
 * - Uses Link/useNavigate for navigation
 * - Type-safe loader/action data
 *
 * @module routes/cases/case-detail
 */

import { casesApi, documentsApi } from '@/lib/frontend-api';
import { CaseDetail } from '@/routes/cases/ui/pages/CaseDetailPage';
import { Case, LegalDocument, Party } from '@/types';
import { Suspense, useCallback } from 'react';
import { Await, defer, redirect, useLoaderData, useNavigate } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createCaseMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/case-detail";

function CardSkeleton() {
  return <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />;
}

// ============================================================================
// Meta Tags
// ============================================================================

/**
 * Dynamic meta tags based on case data
 */
export function meta({ data }: Route.MetaArgs) {
  return createCaseMeta({
    caseTitle: data?.caseData?.title,
    caseNumber: data?.caseData?.caseNumber,
  });
}

// ============================================================================
// Loader - Server-side Data Fetching with Streaming
// ============================================================================

/**
 * Fetches case data with streaming support for secondary data
 *
 * Pattern:
 * 1. Await critical data immediately (case data - required for render)
 * 2. Return promises for non-critical data (documents, parties - can load later)
 *
 * This enables the page to render quickly with essential data
 * while additional data streams in progressively
 */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
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
  const documentsPromise = documentsApi.getDocumentsByCase(caseId).then(r => r.ok ? r.data.data : []);
  const partiesPromise = casesApi.getCaseParties(caseId).then(r => r.ok ? r.data.data : []);

  return {
    caseData,
    // Return promises - Await component will handle resolution
    documents: documentsPromise,
    parties: partiesPromise,
  };
}

// Force client-side execution for hydration (needed for localStorage auth)
clientLoader.hydrate = true as const;

// ============================================================================
// Action - Form Submissions
// ============================================================================

/**
 * Handles case mutations (update, delete)
 * Supports progressive enhancement
 */
export async function action({ params, request }: Route.ActionArgs) {
  const { caseId } = params;

  if (!caseId) {
    return { success: false, error: "Case ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update": {
      try {
        // Extract all form fields except intent
        const updates: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
          if (key !== "intent" && typeof value === "string") {
            updates[key] = value;
          }
        }

        await DataService.cases.update(caseId, updates);
        return { success: true, message: "Case updated successfully" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to update case",
        };
      }
    }

    case "delete": {
      try {
        await DataService.cases.delete(caseId);
        // Redirect to cases list on successful delete
        return redirect("/cases");
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to delete case",
        };
      }
    }

    case "add-document": {
      // Handle document upload
      const file = formData.get("file") as File;
      const title = formData.get("title") as string;
      const logAsEvidence = formData.get("logAsEvidence") === "true";

      if (!file || !title) {
        return { success: false, error: "File and title are required" };
      }

      try {
        const savedDoc = await DataService.documents.upload(file, {
          title,
          caseId,
          category: 'case_document',
          uploadedAt: new Date().toISOString(),
          tags: logAsEvidence ? ['Evidence'] : []
        });

        // Trigger integration event
        await IntegrationOrchestrator.publish(SystemEventType.DOCUMENT_UPLOADED, { document: savedDoc });

        if (logAsEvidence) {
          // Auto-create Evidence Item
          const evidence: EvidenceItem = {
            id: `ev-${Date.now()}` as EvidenceId,
            trackingUuid: crypto.randomUUID() as UUID,
            caseId: savedDoc.caseId,
            title: savedDoc.title,
            type: 'Document',
            description: 'Auto-logged via Document Upload',
            collectionDate: new Date().toISOString().split('T')[0] || '',
            collectedBy: 'System',
            custodian: 'Firm DMS',
            location: 'Evidence Vault',
            admissibility: 'Pending',
            chainOfCustody: [{
              id: `cc-${Date.now()}`,
              date: new Date().toISOString(),
              action: 'Intake from DMS',
              actor: 'System',
              notes: 'Linked from Case Documents'
            }],
            tags: ['Document'],
            fileSize: typeof savedDoc.fileSize === 'string' ? savedDoc.fileSize : String(savedDoc.fileSize)
          };
          await DataService.evidence.add(evidence);
        }

        return { success: true, message: "Document added", document: savedDoc };
      } catch (error) {
        console.error("Failed to add document", error);
        return { success: false, error: "Failed to add document" };
      }
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Loading Components
// ============================================================================

/**
 * Loading skeleton for the case detail page
 */
function CaseDetailSkeleton() {
  return (
    <div className="animate-pulse p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 rounded-t bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <div>
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading indicator for streamed data sections
 */
function StreamedDataLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 p-4 text-sm text-gray-500 dark:text-gray-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
      <span>Loading {label}...</span>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function CaseDetailRoute() {
  const { caseData, documents, parties } = useLoaderData() as unknown as {
    caseData: Case;
    documents: Promise<LegalDocument[]>;
    parties: Promise<Party[]>;
  };
  const navigate = useNavigate();

  // Memoized navigation handlers
  const handleBack = useCallback(() => {
    navigate('/cases');
  }, [navigate]);

  const handleSelectCase = useCallback((selectedCase: { id: string }) => {
    navigate(`/cases/${selectedCase.id}`);
  }, [navigate]);

  return (
    <Suspense fallback={<CaseDetailSkeleton />}>
      {/*
        Nested Await components for progressive data loading
        The outer Suspense catches any loading state
        Each Await resolves its promise and renders when ready
      */}
      <Await
        resolve={documents}
        errorElement={<StreamedDataLoading label="documents (error)" />}
      >
        {(resolvedDocuments: LegalDocument[]) => (
          <Await
            resolve={parties}
            errorElement={<StreamedDataLoading label="parties (error)" />}
          >
            {(resolvedParties: Party[]) => (
              <CaseDetail
                caseData={caseData}
                initialDocuments={resolvedDocuments}
                initialParties={resolvedParties}
                onBack={handleBack}
                onSelectCase={handleSelectCase}
                initialTab="Overview"
              />
            )}
          </Await>
        )}
      </Await>
    </Suspense>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

/**
 * Route-specific error boundary with 404 handling
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error("Case detail error:", error);

  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="Case Not Found"
        message="The case you're looking for doesn't exist or has been deleted."
        backTo="/cases"
        backLabel="Back to Cases"
      />
    );
  }

  // Generic error handling
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Case"
      message="We couldn't load this case. Please try again."
      backTo="/cases"
      backLabel="Back to Cases"
      onRetry={() => window.location.reload()}
    />
  );
}
