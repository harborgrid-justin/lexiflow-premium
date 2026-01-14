/**
 * Case Routes - Shared Loaders and Actions
 *
 * ENTERPRISE ARCHITECTURE PATTERN:
 * - Loaders are THE source of data truth
 * - defer() for parallel data fetching
 * - Actions handle mutations
 * - Server-first (when auth is fixed, currently clientLoader)
 *
 * DATA FLOW:
 * Server → Loader → Route → Provider → View
 *
 * TRANSITIONS:
 * Loaders run before navigation completes
 * Use defer() for progressive rendering
 *
 * @module routes/cases/loader
 */

import { DataService } from "@/services/data/dataService";
import type { Case } from "@/types";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * Case List Loader
 *
 * PATTERN: defer() for parallel fetching
 * - Critical data (cases) loads first
 * - Non-critical data (invoices) deferred
 * - Both fetch in parallel
 * - Suspense boundaries handle progressive rendering
 *
 * TODO: Convert to server loader when auth is cookie-based
 * Currently clientLoader due to localStorage auth tokens
 */
export async function clientLoader() {
  // Parallel data fetching
  const casesPromise = DataService.cases.getAll();
  const invoicesPromise = DataService.invoices.getAll();

  // Wait for both promises (TODO: Use defer when React Router supports it)
  const [cases, invoices] = await Promise.all([casesPromise, invoicesPromise]);

  return { cases, invoices };
}

// Enable hydration (SSR support)
clientLoader.hydrate = true as const;

/**
 * Future server loader (when auth is fixed)
 *
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   // Session from HTTP-only cookie (automatic)
 *   const session = await getSession(request);
 *
 *   if (!session.user) {
 *     throw redirect('/login');
 *   }
 *
 *   return defer({
 *     cases: DataService.cases.getAll(),
 *     invoices: DataService.invoices.getAll(),
 *   });
 * }
 */

/**
 * Case List Action
 *
 * Handles form submissions for CRUD operations
 * - Progressive enhancement (works without JS)
 * - Intent-based routing
 * - Server-side validation
 * - Optimistic updates via fetcher
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const title = formData.get("title") as string;
      const caseNumber = formData.get("caseNumber") as string;

      // Server-side validation
      if (!title?.trim()) {
        return {
          success: false,
          error: "Title is required",
          fieldErrors: { title: "Required" },
        };
      }

      if (!caseNumber?.trim()) {
        return {
          success: false,
          error: "Case number is required",
          fieldErrors: { caseNumber: "Required" },
        };
      }

      try {
        const newCase = await DataService.cases.add({
          title: title.trim(),
          caseNumber: caseNumber.trim(),
          status: "Active",
        } as Case);

        // Redirect to new case detail
        return redirect(`/cases/${newCase.id}`);
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create case",
        };
      }
    }

    case "delete": {
      const caseId = formData.get("caseId") as string;

      if (!caseId) {
        return { success: false, error: "Case ID is required" };
      }

      try {
        await DataService.cases.delete(caseId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete case",
        };
      }
    }

    case "update": {
      const caseId = formData.get("caseId") as string;
      const updates = Object.fromEntries(formData.entries());
      delete updates.intent;
      delete updates.caseId;

      if (!caseId) {
        return { success: false, error: "Case ID is required" };
      }

      try {
        await DataService.cases.update(caseId, updates as Partial<Case>);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update case",
        };
      }
    }

    default:
      return { success: false, error: "Invalid action intent" };
  }
}

/**
 * Type export for useLoaderData<typeof loader>
 */
export type CaseListLoaderData = {
  cases: Case[];
  invoices: Invoice[];
};
