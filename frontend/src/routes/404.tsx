/**
 * 404 Not Found Page
 *
 * Displayed when user navigates to a non-existent route
 */

import { useTheme } from "@/hooks/useTheme";
import { Link } from 'react-router';

export default function NotFoundPage() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4`} style={{ backgroundColor: theme.background }}>
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold mb-4" style={{ color: theme.text.tertiary }}>404</h1>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: theme.primary.light }} />
            </div>
            <h2 className="relative text-3xl font-semibold mb-2" style={{ color: theme.text.primary }}>Page Not Found</h2>
          </div>
          <p className="max-w-md mx-auto mt-4" style={{ color: theme.text.secondary }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 font-medium rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: theme.surface.raised, color: theme.text.primary }}
          >
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-3 text-white font-medium rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: theme.primary.DEFAULT }}
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8" style={{ borderTop: `1px solid ${theme.border.default}` }}>
          <p className="text-sm mb-4" style={{ color: theme.text.secondary }}>Or try these popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/cases"
              className="px-4 py-2 text-sm rounded border transition-colors hover:opacity-80"
              style={{ backgroundColor: theme.surface.raised, borderColor: theme.border.default, color: theme.text.secondary }}
            >
              Cases
            </Link>
            <Link
              to="/documents"
              className="px-4 py-2 text-sm rounded border transition-colors hover:opacity-80"
              style={{ backgroundColor: theme.surface.raised, borderColor: theme.border.default, color: theme.text.secondary }}
            >
              Documents
            </Link>
            <Link
              to="/calendar"
              className="px-4 py-2 text-sm rounded border transition-colors hover:opacity-80"
              style={{ backgroundColor: theme.surface.raised, borderColor: theme.border.default, color: theme.text.secondary }}
            >
              Calendar
            </Link>
            <Link
              to="/billing"
              className="px-4 py-2 text-sm rounded border transition-colors hover:opacity-80"
              style={{ backgroundColor: theme.surface.raised, borderColor: theme.border.default, color: theme.text.secondary }}
            >
              Billing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// HMR compatibility for React Router v7
if (import.meta.hot) {
  import.meta.hot.accept();
}
