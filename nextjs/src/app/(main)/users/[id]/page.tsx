/**
 * User Detail Page - Server Component with Data Fetching
 * Dynamic route for individual user profile view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for users detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of users IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.USERS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch users list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: UserDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const user = await apiFetch(API_ENDPOINTS.USERS.DETAIL(id));
    return {
      title: `${user.name || 'User'} | LexiFlow`,
      description: `Profile for ${user.name}`,
    };
  } catch (error) {
    return { title: 'User Not Found' };
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let user;
  try {
    user = await apiFetch(API_ENDPOINTS.USERS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading user profile...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{user.email}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Role:</span>
                  <span className="ml-2 font-medium">{user.role}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Department:</span>
                  <span className="ml-2">{user.department}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Joined:</span>
                  <span className="ml-2">{user.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
