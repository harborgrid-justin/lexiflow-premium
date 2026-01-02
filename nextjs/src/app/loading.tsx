/**
 * Root Loading UI - Enterprise Grade
 *
 * Displays while the root layout or page is loading.
 * Provides smooth loading experience for initial app load.
 *
 * Next.js 16 Compliance:
 * - Server Component (loading UIs can be server-side)
 * - Instant display (no JavaScript required)
 * - Matches application branding
 * - Accessible loading indicators
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */

export default function RootLoading() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            {/* Animated Logo/Spinner */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-3 bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center">
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
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
            </div>

            {/* Loading Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Loading LexiFlow
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Preparing your legal workspace...
              </p>
            </div>

            {/* Animated Dots */}
            <div className="flex items-center justify-center gap-1 mt-6">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
