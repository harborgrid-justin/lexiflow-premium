/**
 * Main Route Group Loading UI - Enterprise Grade
 *
 * Displays while pages in the main application are loading.
 * Provides consistent, branded loading experience across all authenticated routes.
 *
 * Next.js 16 Compliance:
 * - Server Component (instant display, no hydration needed)
 * - Matches application layout structure
 * - Accessible loading states
 * - Optimized for perceived performance
 *
 * Coverage: All 165 pages in (main) route group
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */

export default function MainLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-6 max-w-md">
        {/* Primary Loading Spinner */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full" />

          {/* Animated ring */}
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin" />

          {/* Inner icon */}
          <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Loading...
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please wait while we prepare your content
          </p>
        </div>

        {/* Animated Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          />
          <div
            className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '1s' }}
          />
          <div
            className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '1s' }}
          />
        </div>

        {/* Optional: Skeleton Content Preview */}
        <div className="mt-8 space-y-3 px-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-3/4 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-1/2 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
