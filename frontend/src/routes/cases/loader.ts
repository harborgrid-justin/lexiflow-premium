/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

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

import { billingApi, casesApi } from "@/lib/frontend-api";
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
  const casesPromise = casesApi.getAll({ page: 1, limit: 1000 });
  const invoicesPromise = billingApi.getAllInvoices({});

  // Wait for both promises (TODO: Use defer when React Router supports it)
  const [casesResult, invoicesResult] = await Promise.all([
    casesPromise,
    invoicesPromise,
  ]);

  const cases = casesResult.ok ? casesResult.data.data : [];
  const invoices = invoicesResult.ok ? invoicesResult.data : [];

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
        const result = await casesApi.create({
          title: title.trim(),
          caseNumber: caseNumber.trim(),
          status: "Active",
        });

        if (!result.ok) {
          return { success: false, error: result.error.message };
        }

        // Redirect to new case detail
        return redirect(`/cases/${result.data.id}`);
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
        const result = await casesApi.remove(caseId);
        if (!result.ok) {
          return { success: false, error: result.error.message };
        }
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
        const result = await casesApi.update(caseId, updates as Partial<Case>);
        if (!result.ok) {
          return { success: false, error: result.error.message };
        }
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
