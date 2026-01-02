/**
 * Admin Page - Server Component with Data Fetching
 * Fetches system health and admin data
 */
import AdminPanel from '@/components/admin/AdminPanel';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Admin | LexiFlow',
  description: 'System Administration',
};

export default async function AdminPage(): Promise<React.JSX.Element> {
  // Fetch system health and admin data
  let healthData = null;
  let usersCount = 0;

  try {
    const [health, users] = await Promise.all([
      apiFetch(API_ENDPOINTS.HEALTH.CHECK).catch(() => null),
      apiFetch(API_ENDPOINTS.USERS.LIST).catch(() => []),
    ]);
    healthData = health;
    usersCount = Array.isArray(users) ? users.length : 0;
  } catch (error) {
    console.error('Failed to load admin data:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading admin panel...</div>}>
        <AdminPanel initialHealth={healthData} initialUsersCount={usersCount} />
      </Suspense>
    </div>
  );
}
