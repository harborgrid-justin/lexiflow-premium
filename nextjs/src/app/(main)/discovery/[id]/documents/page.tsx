/**
 * Document Collection Page
 * Manage documents associated with a discovery request
 *
 * Next.js 16 Compliance:
 * - Async params handling
 * - Suspense boundaries for streaming
 * - generateMetadata with async params
 *
 * @module discovery/[id]/documents/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardBody, Button, SkeletonLine } from '@/components/ui';
import {
  ArrowLeft,
  Upload,
  Download,
  FolderOpen,
  FileText,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { getDiscoveryRequest, searchDocuments } from '../../_actions';
import { DocumentFilters } from './_components/DocumentFilters';
import { DocumentsClient } from './_components/DocumentsClient';

// ============================================================================
// Metadata
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    keywords?: string;
    custodian?: string;
    status?: string;
    fileType?: string;
    dateFrom?: string;
    dateTo?: string;
    responsive?: string;
    privileged?: string;
    hasAttachments?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getDiscoveryRequest(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Documents | Discovery | LexiFlow',
    };
  }

  return {
    title: `Documents - ${result.data.title} | Discovery | LexiFlow`,
    description: `Manage documents for discovery request: ${result.data.title}`,
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function DocumentCollectionPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const result = await getDiscoveryRequest(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const request = result.data;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/discovery/${request.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {request.title}
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Document Collection
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage documents for {request.title}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button icon={<Upload className="h-4 w-4" />}>
              Upload Documents
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FolderOpen className="h-5 w-5" />}
          label="Total Documents"
          value={request.documentCount?.toLocaleString() || '0'}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Reviewed"
          value="0"
          subtext="0%"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Flagged"
          value="0"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Privileged"
          value="0"
        />
      </div>

      {/* Filters and Documents Table with Bulk Actions */}
      <Suspense fallback={<DocumentsSkeleton discoveryRequestId={resolvedParams.id} />}>
        <DocumentsWithFilters
          discoveryRequestId={resolvedParams.id}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    </>
  );
}

// ============================================================================
// Server Components
// ============================================================================

interface DocumentSearchParams {
  page?: string;
  keywords?: string;
  custodian?: string;
  status?: string;
  fileType?: string;
  dateFrom?: string;
  dateTo?: string;
  responsive?: string;
  privileged?: string;
  hasAttachments?: string;
}

async function DocumentsWithFilters({
  discoveryRequestId,
  searchParams,
}: {
  discoveryRequestId: string;
  searchParams: DocumentSearchParams;
}) {
  const result = await searchDocuments({
    discoveryRequestId,
    keywords: searchParams.keywords,
    custodians: searchParams.custodian ? [searchParams.custodian] : undefined,
    reviewStatus: searchParams.status ? [searchParams.status as 'not_reviewed' | 'in_review' | 'reviewed' | 'flagged'] : undefined,
    fileTypes: searchParams.fileType ? [searchParams.fileType] : undefined,
    dateRange: (searchParams.dateFrom || searchParams.dateTo)
      ? { start: searchParams.dateFrom, end: searchParams.dateTo }
      : undefined,
    responsive: searchParams.responsive as 'yes' | 'no' | 'maybe' | 'not_coded' | undefined,
    privileged: searchParams.privileged as 'yes' | 'no' | 'not_coded' | undefined,
    hasAttachments: searchParams.hasAttachments
      ? searchParams.hasAttachments === 'true'
      : undefined,
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    pageSize: 50,
  });

  const resultCount = result.success && result.data ? result.data.total : undefined;

  return (
    <>
      {/* Filters with result count */}
      <Card className="mb-6">
        <CardBody>
          <DocumentFilters
            discoveryRequestId={discoveryRequestId}
            resultCount={resultCount}
          />
        </CardBody>
      </Card>

      {/* Documents */}
      {!result.success || !result.data ? (
        <Card>
          <CardBody>
            <p className="text-red-600 dark:text-red-400">
              Failed to load documents: {result.error}
            </p>
          </CardBody>
        </Card>
      ) : result.data.items.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Documents Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Upload documents or adjust your filters
              </p>
              <Button icon={<Upload className="h-4 w-4" />}>
                Upload Documents
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <DocumentsClient
          discoveryRequestId={discoveryRequestId}
          documents={result.data.items}
          totalCount={result.data.total}
          currentPage={result.data.page}
          totalPages={result.data.totalPages}
        />
      )}
    </>
  );
}

function DocumentsSkeleton({ discoveryRequestId }: { discoveryRequestId: string }) {
  return (
    <>
      {/* Filters skeleton - show filters immediately without result count */}
      <Card className="mb-6">
        <CardBody>
          <DocumentFilters discoveryRequestId={discoveryRequestId} />
        </CardBody>
      </Card>

      {/* Table skeleton */}
      <DocumentTableSkeleton />
    </>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {value}
            {subtext && (
              <span className="text-sm font-normal text-slate-500 ml-1">
                {subtext}
              </span>
            )}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function DocumentTableSkeleton() {
  return (
    <Card>
      <CardBody className="p-0">
        <div className="px-6 py-4">
          <SkeletonLine lines={10} className="h-12" />
        </div>
      </CardBody>
    </Card>
  );
}
