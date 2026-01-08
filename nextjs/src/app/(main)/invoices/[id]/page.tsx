/**
 * Invoice Detail Page - Server Component with Data Fetching
 * Dynamic route for individual invoice view
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Revalidate every 30 minutes

/**
 * Generate static params for invoices detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of invoices IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.INVOICES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch invoices list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const invoice = await apiFetch(API_ENDPOINTS.INVOICES.DETAIL(id)) as any;
    return {
      title: `Invoice #${invoice.invoiceNumber} | LexiFlow`,
      description: `Invoice for ${invoice.clientName}`,
    };
  } catch (error) {
    return { title: 'Invoice Not Found' };
  }
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let invoice: any;
  try {
    invoice = await apiFetch(API_ENDPOINTS.INVOICES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading invoice...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Client: {invoice.clientName}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${invoice.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Status: {invoice.status}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Issue Date:</span>
              <span className="ml-2">{invoice.issueDate}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Due Date:</span>
              <span className="ml-2">{invoice.dueDate}</span>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
