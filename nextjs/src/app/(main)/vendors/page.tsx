/**
 * Vendors List Page - Server Component with Data Fetching
 * Manage vendors and service providers
 */
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Vendors | LexiFlow',
  description: 'Vendor and service provider management',
};

async function VendorsList() {
  const vendors = await apiFetch(API_ENDPOINTS.VENDORS.LIST);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spend YTD</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {vendors.map((vendor: any) => (
            <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {vendor.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {vendor.serviceType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {vendor.contact}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-semibold">
                ${vendor.spendYTD?.toLocaleString() || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link href={`/vendors/${vendor.id}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Vendors</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Vendor
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading vendors...</div>}>
        <VendorsList />
      </Suspense>
    </div>
  );
}
