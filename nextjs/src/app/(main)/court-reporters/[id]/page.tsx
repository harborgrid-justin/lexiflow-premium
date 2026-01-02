/**
 * Court Reporter Detail Page - Server Component with Data Fetching
 * Detailed view of court reporter with contact info, calendar, and transcript history
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CourtReporterDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for court-reporters detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of court-reporters IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.COURT_REPORTERS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch court-reporters list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: CourtReporterDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const reporter = await apiFetch(API_ENDPOINTS.COURT_REPORTERS.DETAIL(id)) as any;
    return {
      title: `Court Reporter: ${reporter.name || id} | LexiFlow`,
      description: reporter.firm || 'Court reporter details',
    };
  } catch {
    return { title: 'Court Reporter Not Found' };
  }
}

async function ReporterDetails({ id }: { id: string }) {
  const reporter = await apiFetch(API_ENDPOINTS.COURT_REPORTERS.DETAIL(id));

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{reporter.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Firm</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{reporter.firm || 'Independent'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Phone</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{reporter.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-blue-600 hover:underline">
              <a href={`mailto:${reporter.email}`}>{reporter.email}</a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Certification</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{reporter.certification}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Service Area</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{reporter.serviceArea}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Schedule</h2>
        <div className="space-y-3">
          {reporter.upcomingAppointments?.map((appt: any) => (
            <div key={appt.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{appt.caseNumber}</p>
                  <p className="text-sm text-slate-500">{appt.type} • {appt.location}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                  {appt.date}
                </span>
              </div>
            </div>
          )) || <p className="text-slate-500">No upcoming appointments</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Transcript History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Case</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {reporter.transcripts?.map((transcript: any) => (
                <tr key={transcript.id}>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{transcript.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{transcript.caseNumber}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{transcript.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${transcript.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      transcript.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                      {transcript.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transcript.url && (
                      <a href={transcript.url} className="text-blue-600 hover:underline">View</a>
                    )}
                  </td>
                </tr>
              )) || (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-slate-500">No transcripts available</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CourtReporterDetailPage({ params }: CourtReporterDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/court-reporters" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Court Reporters
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Court Reporter Details
        </h1>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <ReporterDetails id={id} />
        </Suspense>
      </div>
    </div>
  );
}
