/**
 * Invoice Detail Page - Server Component with Data Fetching
 * Dynamic route for individual invoice view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
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

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
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
