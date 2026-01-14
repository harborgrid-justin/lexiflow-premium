/**
 * Route Skeleton Components - Suspense Fallbacks
 *
 * ENTERPRISE ARCHITECTURE PATTERN:
 * - Shared loading skeletons for route Suspense boundaries
 * - Consistent UX across all routes
 * - Proper accessibility (aria-busy, aria-live)
 */

interface RouteSkeletonProps {
  title?: string;
}

/**
 * Generic Route Skeleton - Used for most routes
 */
export function RouteSkeleton({ title = 'Loading' }: RouteSkeletonProps) {
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-pulse"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={`${title}...`}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Title */}
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}
        </div>

        {/* Main Content */}
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

/**
 * Table Route Skeleton - For list/table routes
 */
export function TableRouteSkeleton({ title = 'Loading' }: RouteSkeletonProps) {
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-pulse"
      role="status"
      aria-busy="true"
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32" />
        </div>

        {/* Search/Filters */}
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>

        {/* Table */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Generic Route Error - Error Boundary Fallback
 */
interface RouteErrorProps {
  title?: string;
  message?: string;
}

export function RouteError({
  title = 'Failed to load page',
  message = 'Please refresh the page or contact support if the problem persists'
}: RouteErrorProps) {
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-rose-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-rose-600">{title}</h2>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
