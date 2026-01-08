/**
 * Discovery Not Found Page
 */

import { Button } from '@/components/ui';
import { FileX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DiscoveryNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileX className="h-8 w-8 text-slate-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Discovery Request Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The discovery request you are looking for does not exist or has been deleted.
        </p>

        <Link href="/discovery">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Discovery
          </Button>
        </Link>
      </div>
    </div>
  );
}
