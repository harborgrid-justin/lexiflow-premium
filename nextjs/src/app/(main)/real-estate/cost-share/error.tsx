"use client";

import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CostShareError({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Failed to Load Cost Share Data
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          We couldn&apos;t load the cost share data. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button onClick={() => router.push("/real-estate")} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
