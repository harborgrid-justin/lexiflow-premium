/**
 * Hydration Fallback Component
 *
 * Loading state displayed during client-side hydration.
 * Shows before the JavaScript bundle loads and executes.
 *
 * @module rendering/hydration/HydrateFallback
 */

export interface HydrateFallbackProps {
  /** Custom loading message */
  message?: string;
  /** Brand name to display */
  brandName?: string;
  /** Whether to show animated spinner */
  showSpinner?: boolean;
}

/**
 * Fallback component shown during SSR hydration
 *
 * This component is displayed while the client-side JavaScript is loading
 * and before React takes over the application. It should be simple and
 * not rely on any JavaScript execution.
 */
export function HydrateFallback({
  message = "Loading LexiFlow...",
  brandName = "L",
  showSpinner = true,
}: HydrateFallbackProps = {}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-label="Loading application"
    >
      <div className="flex flex-col items-center gap-4">
        {showSpinner && (
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {brandName}
              </span>
            </div>
          </div>
        )}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Default export for compatibility
 */
export default HydrateFallback;
