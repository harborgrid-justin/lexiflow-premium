/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Correspondence Index Route
 *
 * Manage legal correspondence, letters, and communications with clients,
 * opposing counsel, courts, and other parties.
 *
 * @module routes/correspondence/index
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { communicationsApi } from '@/lib/frontend-api';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';


// Import standard components
import { CorrespondenceProvider } from './CorrespondenceProvider';
import { CorrespondenceView } from './CorrespondenceView';

import type { Route } from "./+types/index";
import type { LoaderFunctionArgs } from "react-router";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Correspondence',
    count: data?.items?.length,
    description: 'Manage legal correspondence and communications',
  });
}

// ============================================================================
// Client Loader
// ============================================================================

/**
 * Fetches correspondence on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader({ request: _request }: LoaderFunctionArgs) {
  const result = await communicationsApi.getAllCorrespondence({
    page: 1,
    limit: 200,
  });

  const items = result.ok ? result.data.data : [];

  type CorrespondenceItem = {
    id: string;
    correspondenceType?: string;
    status?: string;
    sender?: string;
    date?: string;
    subject?: string;
    notes?: string;
    recipients?: string[];
  };

  const emails = items
    .filter((item: CorrespondenceItem) => item.correspondenceType === "email")
    .map((item: CorrespondenceItem) => ({
      id: item.id,
      read: item.status === "received",
      from: item.sender || "Unknown",
      date: item.date,
      subject: item.subject,
      preview: item.notes || "",
    }));

  const letters = items
    .filter((item: CorrespondenceItem) => item.correspondenceType === "letter")
    .map((item: CorrespondenceItem) => ({
      id: item.id,
      title: item.subject,
      recipient: item.recipients?.join(", ") || "Unknown",
      date: item.date,
    }));

  const templates = items
    .filter((item: CorrespondenceItem) => item.status === "draft")
    .map((item: CorrespondenceItem) => ({
      id: item.id,
      name: item.subject,
      category: item.correspondenceType,
    }));

  return { emails, letters, templates, items };
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

// ============================================================================
// Action
// ============================================================================

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create":
        // Creation is typically handled via modal/form submission to API directly
        {
          const data = Object.fromEntries(formData);
          delete data.intent;

          const result = await communicationsApi.createCorrespondence({
            type: (data.type as string) || "letter",
            subject: (data.subject as string) || "",
            body: (data.body as string) || "",
            senderId: (data.senderId as string) || "system",
            recipient: (data.recipient as string) || "Unknown",
            recipientEmail: data.recipientEmail as string,
            recipientAddress: data.recipientAddress as string,
            caseId: data.caseId as string,
            status: (data.status as string) || "draft",
            metadata: data.metadata as Record<string, unknown> | undefined,
          });

          if (!result.ok) {
            return { success: false, error: result.error.message };
          }

          return { success: true, message: "Correspondence created" };
        }
      case "delete": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "ID required" };

        const result = await communicationsApi.deleteCorrespondence(id);
        if (!result.ok) {
          return { success: false, error: result.error.message };
        }

        return { success: true, message: "Correspondence deleted" };
      }
      case "archive": {
        const archiveId = formData.get("id") as string;
        if (!archiveId) return { success: false, error: "ID required" };

        const result = await communicationsApi.updateCorrespondence(archiveId, {
          status: 'filed',
        });

        if (!result.ok) {
          return { success: false, error: result.error.message };
        }

        return { success: true, message: "Correspondence archived" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch {
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function CorrespondenceIndexRoute() {
  const initialData = useLoaderData();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Correspondence" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load correspondence" />}>
        {(resolved) => (
          <CorrespondenceProvider
            initialEmails={resolved.emails}
            initialLetters={resolved.letters}
            initialTemplates={resolved.templates}
          >
            <CorrespondenceView />
          </CorrespondenceProvider>
        )}
      </Await>
    </Suspense>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
