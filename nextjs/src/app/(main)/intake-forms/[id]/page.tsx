/**
 * Intake Form Detail Page - Server Component with Data Fetching
 * Dynamic route for individual intake form with fields, client info, convert to case
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface IntakeFormDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for intake-forms detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of intake-forms IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.INTAKE_FORMS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch intake-forms list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: IntakeFormDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const form = await apiFetch(API_ENDPOINTS.INTAKE_FORMS.DETAIL(id)) as any;
    return {
      title: `${form.formName} - ${form.clientName} | LexiFlow`,
      description: `Intake form for ${form.clientName}`,
    };
  } catch (error) {
    return { title: 'Intake Form Not Found' };
  }
}

export default async function IntakeFormDetailPage({ params }: IntakeFormDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let form: any;
  try {
    form = await apiFetch(API_ENDPOINTS.INTAKE_FORMS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading intake form...</div>}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{form.formName}</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Form ID: {form.formNumber}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Convert to Case
                </button>
                <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                  Download PDF
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Submitted:</span>
                <span className="ml-2">{form.submissionDate}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Assigned To:</span>
                <span className="ml-2">{form.assignedTo}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${form.status === 'Converted'
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-800'
                      }`}
                  >
                    {form.status}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Full Name</div>
                  <div className="font-semibold text-lg">{form.clientInfo?.fullName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Email</div>
                  <div className="font-medium">{form.clientInfo?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Phone</div>
                  <div className="font-medium">{form.clientInfo?.phone}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Address</div>
                  <div className="font-medium">{form.clientInfo?.address}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Date of Birth</div>
                  <div className="font-medium">{form.clientInfo?.dateOfBirth}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Preferred Contact</div>
                  <div className="font-medium">{form.clientInfo?.preferredContact}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Case Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Legal Matter Details</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Case Type</div>
                <div className="font-semibold">{form.caseDetails?.type}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Description of Legal Issue
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <p className="whitespace-pre-wrap">{form.caseDetails?.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Incident Date
                  </div>
                  <div className="font-medium">{form.caseDetails?.incidentDate}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Urgency</div>
                  <div className="font-medium">
                    <span
                      className={`px-2 py-1 text-xs rounded ${form.caseDetails?.urgency === 'High'
                          ? 'bg-rose-100 dark:bg-rose-900 text-rose-800'
                          : form.caseDetails?.urgency === 'Medium'
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-800'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800'
                        }`}
                    >
                      {form.caseDetails?.urgency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Form Fields */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Additional Information</h2>
            <div className="space-y-4">
              {form.fields?.map((field: any, idx: number) => (
                <div key={idx} className="border-b pb-4 last:border-b-0">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {field.label}
                  </div>
                  <div className="font-medium">
                    {field.type === 'textarea' ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
                        <p className="whitespace-pre-wrap">{field.value}</p>
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <span className={field.value ? 'text-emerald-600' : 'text-slate-400'}>
                        {field.value ? '✓ Yes' : '✗ No'}
                      </span>
                    ) : (
                      field.value
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {form.attachments && form.attachments.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Attachments</h2>
              <div className="space-y-2">
                {form.attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        📄
                      </div>
                      <div>
                        <div className="font-medium">{attachment.filename}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {attachment.size}
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
              Ready to Convert?
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
              Converting this intake form will create a new case file with all the information
              provided by the client.
            </p>
            <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold">
              Convert to Case
            </button>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
