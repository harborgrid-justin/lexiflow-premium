/**
 * 404 Not Found Page
 *
 * Displayed when user navigates to a non-existent route
 */

import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-700 mb-4">404</h1>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
            <h2 className="relative text-3xl font-semibold text-white mb-2">Page Not Found</h2>
          </div>
          <p className="text-slate-400 max-w-md mx-auto mt-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/cases"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded border border-slate-700 transition-colors"
            >
              Cases
            </Link>
            <Link
              to="/documents"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded border border-slate-700 transition-colors"
            >
              Documents
            </Link>
            <Link
              to="/calendar"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded border border-slate-700 transition-colors"
            >
              Calendar
            </Link>
            <Link
              to="/billing"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded border border-slate-700 transition-colors"
            >
              Billing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
