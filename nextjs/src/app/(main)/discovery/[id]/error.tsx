'use client';

/**
 * Discovery Detail Error Boundary
 */

import { Button } from '@/components/ui';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DiscoveryDetailError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Failed to Load Discovery Request
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {error.message || 'We encountered an error while loading this discovery request.'}
        </p>

        {error.digest && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <Button onClick={reset} icon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
          <Link href="/discovery">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Discovery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
