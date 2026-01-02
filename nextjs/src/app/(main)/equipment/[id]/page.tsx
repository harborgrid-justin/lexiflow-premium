/**
 * Equipment Detail Page - Server Component with Data Fetching
 * Detailed view of equipment asset with checkout history and maintenance logs
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';


interface PageProps {
  params: Promise<{ id: string }>;
}

// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for equipment detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of equipment IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.EQUIPMENT.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch equipment list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Equipment Details | LexiFlow',
  description: 'Equipment asset information and history',
};

async function EquipmentDetails({ id }: { id: string }) {
  const equipment = await apiFetch(API_ENDPOINTS.EQUIPMENT.DETAIL(id));
  const history = await apiFetch(API_ENDPOINTS.EQUIPMENT.HISTORY(id));
  const maintenance = await apiFetch(API_ENDPOINTS.EQUIPMENT.MAINTENANCE(id));

  return (
    <div className="space-y-6">
      {/* Equipment Information */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {equipment.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Type:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100">{equipment.type}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Serial Number:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100 font-mono">
              {equipment.serialNumber || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Manufacturer:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100">
              {equipment.manufacturer || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Model:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100">
              {equipment.model || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Location:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100">
              {equipment.location || 'Main Office'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${equipment.status === 'Available'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : equipment.status === 'In Use'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              }`}>
              {equipment.status || 'Available'}
            </span>
          </div>
        </div>

        {/* Specifications */}
        {equipment.specifications && (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Specifications</h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {equipment.specifications}
            </div>
          </div>
        )}
      </div>

      {/* Checkout History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Checkout History
        </h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((record: any) => (
              <div key={record.id} className="border border-slate-200 dark:border-slate-700 rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {record.user}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {record.purpose || 'Equipment checkout'}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-900 dark:text-slate-100">
                      {new Date(record.checkoutDate).toLocaleDateString()}
                    </div>
                    {record.returnDate ? (
                      <div className="text-green-600 dark:text-green-400">
                        Returned {new Date(record.returnDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-blue-600 dark:text-blue-400">Currently checked out</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No checkout history</p>
          )}
        </div>
      </div>

      {/* Maintenance Log */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Maintenance Log
        </h3>
        <div className="space-y-3">
          {maintenance.length > 0 ? (
            maintenance.map((log: any) => (
              <div key={log.id} className="border border-slate-200 dark:border-slate-700 rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {log.type}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {log.description}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Performed by: {log.technician}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-900 dark:text-slate-100">
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      ${log.cost?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No maintenance records</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EquipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/equipment" className="text-blue-600 hover:underline">
          ← Back to Equipment
        </Link>
        <div className="space-x-2">
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            Checkout
          </button>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            Log Maintenance
          </button>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading equipment details...</div>}>
        <EquipmentDetails id={params.id} />
      </Suspense>
    </div>
  );
}
