/**
 * Vendor Detail Page - Server Component with Data Fetching
 * Detailed view of vendor information
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';


interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for vendors detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of vendors IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.VENDORS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch vendors list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: VendorDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const vendor = await apiFetch(API_ENDPOINTS.VENDORS.DETAIL(id));
    return {
      title: `Vendor: ${vendor.name || id} | LexiFlow`,
      description: vendor.description || 'Vendor details',
    };
  } catch {
    return { title: 'Vendor Not Found' };
  }
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let vendor;
  try {
    vendor = await apiFetch(API_ENDPOINTS.VENDORS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/vendors" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Vendors
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {vendor.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Vendor Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Service Type</p>
                <p className="font-medium">{vendor.serviceType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Contact</p>
                <p className="font-medium">{vendor.contact}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium">{vendor.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                <p className="font-medium">{vendor.phone}</p>
              </div>
            </div>
          </div>

          {/* Contracts */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contracts</h2>
            <div className="space-y-3">
              {vendor.contracts?.map((contract: any) => (
                <div key={contract.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
                  <p className="font-medium">{contract.title}</p>
                  <p className="text-sm text-slate-500">{contract.status} • ${contract.value?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
            <div className="space-y-3">
              {vendor.invoices?.map((invoice: any) => (
                <div key={invoice.id} className="border border-slate-200 dark:border-slate-700 rounded p-3 flex justify-between">
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-slate-500">{invoice.date}</p>
                  </div>
                  <p className="font-semibold">${invoice.amount?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Spend YTD</p>
                <p className="text-2xl font-bold text-blue-600">${vendor.spendYTD?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Open Invoices</p>
                <p className="text-2xl font-bold">{vendor.openInvoices || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Contracts</p>
                <p className="text-2xl font-bold">{vendor.activeContracts || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
