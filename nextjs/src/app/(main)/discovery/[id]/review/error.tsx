'use client';

/**
 * Document Review Error Boundary
 */

import { useEffect } from 'react';
import { Card, CardBody, Button } from '@/components/ui';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReviewError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Document review error:', error);
  }, [error]);

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardBody className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Review Failed to Load
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error.message || 'An error occurred while loading the document review interface.'}
          </p>

          {error.digest && (
            <p className="text-xs text-slate-400 mb-6">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <Link href="/discovery">
              <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Discovery
              </Button>
            </Link>
            <Button onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
              Try Again
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
