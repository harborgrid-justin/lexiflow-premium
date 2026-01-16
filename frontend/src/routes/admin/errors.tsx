/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { RouteErrorBoundary } from "../_shared/RouteErrorBoundary";

/**
 * Admin Error Boundary
 *
 * Specifically handles administration domain errors
 * and maps them to user-friendly notifications.
 */
export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Administrative Error"
      message="An error occurred while accessing the administration panel. Ensure you have proper permissions."
    />
  );
}
