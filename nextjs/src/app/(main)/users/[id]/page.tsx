/**
 * User Detail Page - Server Component with Data Fetching
 * Dynamic route for individual user profile view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
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

export default async function UserDetailPage({ params }: UserDetailPageProps) {
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
