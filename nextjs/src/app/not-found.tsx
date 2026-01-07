/**
 * Global Not Found (404) Page
 * Handles all undefined routes in the application
 *
 * Next.js v16 Standard:
 * - File named 'not-found.tsx' at root
 * - Catches all routes not matched by filesystem
 * - Server component (no 'use client' needed)
 * - Returns metadata for SEO
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | LexiFlow',
  description: 'The page you are looking for does not exist.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-4">
            <FileQuestion className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            404
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Page not found
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Action Button */}
        <Link href="/">
          <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            <Home className="w-4 h-4" />
            Return to Dashboard
          </button>
        </Link>

        {/* Suggestion */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            If you think this is a mistake, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
