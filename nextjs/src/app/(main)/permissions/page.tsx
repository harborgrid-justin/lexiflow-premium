/**
 * Permissions Management Page - Server Component with Data Fetching
 * Role-based access control with permission grid UI
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Permissions | LexiFlow',
  description: 'Role-based access control and permissions management',
};

async function PermissionsList() {
  const permissions = await apiFetch(API_ENDPOINTS.PERMISSIONS.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Count</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Module Permissions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Modified</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {permissions.map((permission: any) => (
            <tr key={permission.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {permission.roleName || permission.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {permission.userCount || 0} users
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex flex-wrap gap-1 max-w-md">
                  {permission.modules?.slice(0, 4).map((module: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {module}
                    </span>
                  ))}
                  {permission.modules?.length > 4 && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                      +{permission.modules.length - 4} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {permission.lastModified
                  ? new Date(permission.lastModified).toLocaleDateString()
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link href={`/permissions/${permission.id}`} className="text-blue-600 hover:underline">
                  Edit Permissions
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Permission Grid Legend */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Common Module Permissions:
        </h3>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Cases (View, Edit, Delete)
          </span>
          <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Documents (View, Upload, Download)
          </span>
          <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Billing (View, Create, Approve)
          </span>
          <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Reports (View, Generate, Export)
          </span>
          <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Admin (Full Access)
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Role-based access control and module permissions
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Create Role
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading permissions...</div>}>
        <PermissionsList />
      </Suspense>
    </div>
  );
}
