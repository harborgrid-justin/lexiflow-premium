/**
 * Docket & Filings Route
 *
 * Displays court filings, docket entries, and case schedules with:
 * - Server-side data loading via loader
 * - Filter and search capabilities
 * - File new motion/document actions
 *
 * @module routes/docket/index
 */

import { DataService } from '@/services/data/dataService';
import type { CaseId } from '@/types';
import type { DocketEntry } from '@/types/motion-docket';
import { format } from 'date-fns';
import { Form, Link, useLoaderData, useLocation, useNavigation, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Docket Entries',
    count: data?.entries?.length,
    description: 'Manage court docket entries and filings',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  try {
    const response = await DataService.docket.getAll({ search, type, page });

    // Robust handling of API response structure
    let entries: DocketEntry[] = [];
    if (Array.isArray(response)) {
      entries = response;
    } else if (response && Array.isArray(response.data)) {
      entries = response.data;
    }

    return {
      entries,
      totalCount: (response as any).total || entries.length || 0,
      page: (response as any).page || 1,
      totalPages: (response as any).totalPages || 1
    };
  } catch (error) {
    console.error("Failed to load docket entries:", error);
    throw error; // Let ErrorBoundary handle it
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "file-motion": {
        const title = formData.get("title") as string;
        const caseId = formData.get("caseId") as string;
        const description = formData.get("description") as string;

        if (!title || !caseId) {
          return { success: false, error: "Missing required fields (Title, Case ID)" };
        }

        await DataService.docket.add({
          caseId: caseId as CaseId,
          title,
          description,
          dateFiled: new Date().toISOString(),
          entryDate: new Date().toISOString(),
          type: 'Motion',
          // Default values for required fields
          sequenceNumber: 0,
          docketNumber: 'PENDING'
        });

        return { success: true, message: "Motion filed successfully" };
      }

      case "delete": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "Missing ID" };

        await DataService.docket.delete(id);
        return { success: true, message: "Entry deleted" };
      }

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DocketIndexRoute() {
  const { entries, totalCount, page, totalPages } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigation = useNavigation();
  const location = useLocation();
  console.log('location data:', location);
  const [searchParams] = useSearchParams();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Docket & Filings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage court docket entries and case filings
          </p>
        </div>

        <Link
          to="/docket/file"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          File New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              placeholder="Search docket entries..."
              defaultValue={searchParams.get("search") || ""}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            name="type"
            defaultValue={searchParams.get("type") || ""}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="Motion">Motion</option>
            <option value="Order">Order</option>
            <option value="Filing">Filing</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Filter
          </button>
          {searchParams.toString() && (
            <Link
              to="."
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Clear
            </Link>
          )}
        </Form>
      </div>

      {/* Content */}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Docket Entries Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {searchParams.toString() ? "Try adjusting your filters." : "Get started by filing a new entry or motion."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {Array.isArray(entries) && entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {entry.dateFiled ? format(new Date(entry.dateFiled), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <Link to={`/docket/${entry.id}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                        {entry.title || entry.description}
                      </Link>
                      {entry.caseId && <div className="text-xs text-gray-500">Case: {entry.caseId}</div>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {entry.type || 'Entry'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Form method="post" className="inline-block">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={entry.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          disabled={isSubmitting}
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this entry?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </Form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No docket entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-1 justify-between sm:hidden">
                <Link
                  to={`?page=${Math.max(1, page - 1)}${searchParams.toString().replace(/&?page=\d+/, '')}`}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Previous
                </Link>
                <Link
                  to={`?page=${Math.min(totalPages, page + 1)}${searchParams.toString().replace(/&?page=\d+/, '')}`}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Next
                </Link>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({totalCount} results)
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Link
                      to={`?page=${Math.max(1, page - 1)}${searchParams.toString().replace(/&?page=\d+/, '')}`}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <Link
                      to={`?page=${Math.min(totalPages, page + 1)}${searchParams.toString().replace(/&?page=\d+/, '')}`}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Docket"
      message="We couldn't load the docket entries. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
