/**
 * New Discovery Request Page
 * Form to create a new discovery request
 *
 * Next.js 16 Compliance:
 * - Server Component with Client form component
 * - generateMetadata for SEO
 *
 * @module discovery/new/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NewDiscoveryForm } from './_components/NewDiscoveryForm';

export const metadata: Metadata = {
  title: 'New Discovery Request | LexiFlow',
  description: 'Create a new discovery request for document production, interrogatories, or depositions.',
};

export default function NewDiscoveryPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/discovery"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discovery
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          New Discovery Request
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Create a new discovery request for your litigation matter
        </p>
      </div>

      {/* Form */}
      <NewDiscoveryForm />
    </>
  );
}
