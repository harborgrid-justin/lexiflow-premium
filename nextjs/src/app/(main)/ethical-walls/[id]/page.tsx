/**
 * Ethical Wall Detail Page - Server Component with Data Fetching
 * Detailed view of ethical wall configuration
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';


interface EthicalWallDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for ethical-walls detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of ethical-walls IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.ETHICAL_WALLS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch ethical-walls list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: EthicalWallDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const wall = await apiFetch(API_ENDPOINTS.ETHICAL_WALLS.DETAIL(id)) as any;
    return {
      title: `Ethical Wall: ${wall.name || id} | LexiFlow`,
      description: wall.description || 'Ethical wall details',
    };
  } catch {
    return { title: 'Ethical Wall Not Found' };
  }
}

export default async function EthicalWallDetailPage({ params }: EthicalWallDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let wall: any;
  try {
    wall = await apiFetch(API_ENDPOINTS.ETHICAL_WALLS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/ethical-walls" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Ethical Walls
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {wall.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{wall.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wall Rules */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Wall Rules</h2>
            <div className="space-y-3">
              {wall.rules?.map((rule: any, idx: number) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded p-3">
                  <p className="font-medium">{rule.type}</p>
                  <p className="text-sm text-slate-500">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Restricted Users/Teams */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Restricted List</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium mb-2">Restricted Users</h3>
                <ul className="space-y-2">
                  {wall.restrictedUsers?.map((user: any) => (
                    <li key={user.id} className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded p-2">
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                      </div>
                      <span className="text-xs text-red-600">Restricted</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Allowed Users</h3>
                <ul className="space-y-2">
                  {wall.allowedUsers?.map((user: any) => (
                    <li key={user.id} className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded p-2">
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                      </div>
                      <span className="text-xs text-green-600">Allowed</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Monitoring & Violations */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Monitoring Log</h2>
            <div className="space-y-2">
              {wall.monitoringLog?.map((entry: any) => (
                <div key={entry.id} className="text-sm border-l-4 border-slate-300 dark:border-slate-600 pl-3 py-2">
                  <p className="font-medium">{entry.action}</p>
                  <p className="text-slate-500 text-xs">{entry.user} • {entry.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wall Status */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Current Status</p>
                <p className="text-xl font-bold text-green-600">{wall.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Created</p>
                <p className="font-medium">{wall.dateCreated}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Last Modified</p>
                <p className="font-medium">{wall.lastModified}</p>
              </div>
            </div>
          </div>

          {/* Participants Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Participants</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Restricted Users</p>
                <p className="text-2xl font-bold text-red-600">{wall.restrictedUsers?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Allowed Users</p>
                <p className="text-2xl font-bold text-green-600">{wall.allowedUsers?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Access Attempts</p>
                <p className="text-2xl font-bold">{wall.accessAttempts || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
