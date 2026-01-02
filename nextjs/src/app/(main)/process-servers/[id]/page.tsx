/**
 * Process Server Detail Page - Server Component with Data Fetching
 * Detailed view of process server records
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';


interface ProcessServerDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for process-servers detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of process-servers IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.PROCESS_SERVERS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch process-servers list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: ProcessServerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const server = await apiFetch(API_ENDPOINTS.PROCESS_SERVERS.DETAIL(id));
    return {
      title: `Process Server: ${server.name || id} | LexiFlow`,
      description: server.serviceArea || 'Process server details',
    };
  } catch {
    return { title: 'Process Server Not Found' };
  }
}

export default async function ProcessServerDetailPage({ params }: ProcessServerDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let server;
  try {
    server = await apiFetch(API_ENDPOINTS.PROCESS_SERVERS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/process-servers" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Process Servers
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {server.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service History */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Service History</h2>
            <div className="space-y-3">
              {server.serviceHistory?.map((service: any) => (
                <div key={service.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{service.caseNumber}</p>
                      <p className="text-sm text-slate-500">{service.recipientName}</p>
                      <p className="text-sm text-slate-500">{service.address}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${service.status === 'Served' ? 'bg-green-100 text-green-800' :
                        service.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    {service.date} • {service.attempts} attempts
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Proof of Service Documents */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Proof of Service Documents</h2>
            <div className="space-y-3">
              {server.proofDocuments?.map((doc: any) => (
                <div key={doc.id} className="border border-slate-200 dark:border-slate-700 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{doc.caseNumber}</p>
                    <p className="text-sm text-slate-500">{doc.date} • {doc.fileType}</p>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm">Download</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium">{server.email}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Phone</p>
                <p className="font-medium">{server.phone}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Service Area</p>
                <p className="font-medium">{server.serviceArea}</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Performance</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{server.successRate}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Jobs</p>
                <p className="text-2xl font-bold">{server.activeJobs || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Completed</p>
                <p className="text-2xl font-bold">{server.totalCompleted || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Completion Time</p>
                <p className="text-lg font-semibold">{server.avgCompletionDays} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
