/**
 * Evidence Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evidence',
  description: 'Manage case evidence',
};

export default function EvidencePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Evidence</h1>
      <p className="text-slate-600 dark:text-slate-400">Evidence management interface coming soon.</p>
    </div>
  );
}
