/**
 * Expert Witness Detail Page - Server Component with Data Fetching
 * Detailed profile of expert witness
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';


interface ExpertWitnessDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for expert-witnesses detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of expert-witnesses IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.EXPERT_WITNESSES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch expert-witnesses list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: ExpertWitnessDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const expert = await apiFetch(API_ENDPOINTS.EXPERT_WITNESSES.DETAIL(id)) as any;
    return {
      title: `Expert: ${expert.name || id} | LexiFlow`,
      description: expert.specialty || 'Expert witness profile',
    };
  } catch {
    return { title: 'Expert Not Found' };
  }
}

export default async function ExpertWitnessDetailPage({ params }: ExpertWitnessDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let expert: any;
  try {
    expert = await apiFetch(API_ENDPOINTS.EXPERT_WITNESSES.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/expert-witnesses" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Expert Witnesses
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {expert.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{expert.specialty}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* CV/Education */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Curriculum Vitae</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Education</h3>
                <div className="space-y-2">
                  {expert.education?.map((edu: any, idx: number) => (
                    <div key={idx}>
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-slate-500">{edu.institution} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Certifications</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
                  {expert.certifications?.map((cert: string, idx: number) => (
                    <li key={idx}>{cert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Testimony History */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Testimony History</h2>
            <div className="space-y-3">
              {expert.testimonies?.map((testimony: any) => (
                <div key={testimony.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
                  <p className="font-medium">{testimony.caseName}</p>
                  <p className="text-sm text-slate-500">{testimony.date} • {testimony.court}</p>
                  <p className="text-sm mt-1">{testimony.outcome}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Reports */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Expert Reports</h2>
            <div className="space-y-3">
              {expert.reports?.map((report: any) => (
                <div key={report.id} className="border border-slate-200 dark:border-slate-700 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-slate-500">{report.caseNumber} • {report.date}</p>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm">Download</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium">{expert.email}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Phone</p>
                <p className="font-medium">{expert.phone}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Location</p>
                <p className="font-medium">{expert.location}</p>
              </div>
            </div>
          </div>

          {/* Rates & Availability */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Rates</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hourly Rate</p>
                <p className="text-2xl font-bold text-blue-600">${expert.hourlyRate?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Cases Handled</p>
                <p className="text-2xl font-bold">{expert.casesCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
