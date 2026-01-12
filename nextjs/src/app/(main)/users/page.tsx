/**
 * Users List Page - Server Component with Data Fetching
 * List view of all users
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Users | LexiFlow',
  description: 'Manage users and permissions',
};

export default async function UsersPage(): Promise<React.JSX.Element> {
  // Fetch users from backend
  let users = [];

  try {
    users = (await apiFetch(API_ENDPOINTS.USERS.LIST)) as any[];
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link
          href="/users/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add User
        </Link>
      </div>

      <Suspense fallback={<div>Loading users...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Department</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <tr key={user.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3">
                      <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline">
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{user.department}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Suspense>
    </div>
  );
}
