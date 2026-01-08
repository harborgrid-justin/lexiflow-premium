/**
 * Document Review Workflow Page
 * Interactive document review with coding panel
 *
 * Next.js 16 Compliance:
 * - Async params handling
 * - Suspense boundaries for streaming
 * - generateMetadata with async params
 *
 * @module discovery/[id]/review/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardBody, Badge, Button, SkeletonLine } from '@/components/ui';
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart2,
  Settings,
} from 'lucide-react';
import { getDiscoveryRequest, searchDocuments } from '../../_actions';
import { ReviewWorkspace } from './_components/ReviewWorkspace';

// ============================================================================
// Metadata
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    docId?: string;
    queue?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getDiscoveryRequest(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Document Review | Discovery | LexiFlow',
    };
  }

  return {
    title: `Review Documents - ${result.data.title} | Discovery | LexiFlow`,
    description: `Document review workflow for: ${result.data.title}`,
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function DocumentReviewPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const result = await getDiscoveryRequest(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const request = result.data;

  // Calculate review progress
  const reviewed = request.reviewedCount || 0;
  const total = request.documentCount || 0;
  const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <Link
          href={`/discovery/${request.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {request.title}
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Document Review
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Review and code documents for {request.title}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {reviewed.toLocaleString()} / {total.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Reviewed</p>
              </div>
              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {progress}%
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2">
              <StatBadge
                icon={<Clock className="h-3 w-3" />}
                value={String(total - reviewed)}
                label="Pending"
                variant="warning"
              />
              <StatBadge
                icon={<CheckCircle className="h-3 w-3" />}
                value={String(reviewed)}
                label="Done"
                variant="success"
              />
              <StatBadge
                icon={<AlertTriangle className="h-3 w-3" />}
                value={String(request.flaggedCount || 0)}
                label="Flagged"
                variant="danger"
              />
            </div>

            <Button variant="outline" size="sm" icon={<Settings className="h-4 w-4" />}>
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Review Workspace */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<ReviewWorkspaceSkeleton />}>
          <ReviewSection
            discoveryRequestId={resolvedParams.id}
            initialDocId={resolvedSearchParams.docId}
          />
        </Suspense>
      </div>
    </div>
  );
}

// ============================================================================
// Server Components
// ============================================================================

async function ReviewSection({
  discoveryRequestId,
  initialDocId,
}: {
  discoveryRequestId: string;
  initialDocId?: string;
}) {
  // Fetch documents for review
  const result = await searchDocuments({
    discoveryRequestId,
    pageSize: 100,
  });

  if (!result.success || !result.data) {
    return (
      <Card className="h-full">
        <CardBody className="flex items-center justify-center h-full">
          <p className="text-red-600 dark:text-red-400">
            Failed to load documents: {result.error}
          </p>
        </CardBody>
      </Card>
    );
  }

  if (result.data.items.length === 0) {
    return (
      <Card className="h-full">
        <CardBody className="flex flex-col items-center justify-center h-full">
          <Eye className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No Documents to Review
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-center">
            Upload documents to start the review process.
          </p>
          <Link href={`/discovery/${discoveryRequestId}/documents`}>
            <Button>Go to Documents</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <ReviewWorkspace
      discoveryRequestId={discoveryRequestId}
      documents={result.data.items}
      initialDocId={initialDocId}
    />
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface StatBadgeProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info';
}

function StatBadge({ icon, value, label, variant }: StatBadgeProps) {
  const colors = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${colors[variant]}`}>
      {icon}
      <span className="font-medium">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
}

function ReviewWorkspaceSkeleton() {
  return (
    <div className="h-full grid grid-cols-12 gap-4">
      <div className="col-span-3">
        <Card className="h-full">
          <CardBody className="p-4">
            <SkeletonLine lines={1} className="h-10 mb-4" />
            <SkeletonLine lines={8} className="h-16 mb-2" />
          </CardBody>
        </Card>
      </div>
      <div className="col-span-6">
        <Card className="h-full">
          <CardBody className="p-4">
            <SkeletonLine lines={1} className="h-10 mb-4" />
            <SkeletonLine lines={1} className="h-[400px]" />
          </CardBody>
        </Card>
      </div>
      <div className="col-span-3">
        <Card className="h-full">
          <CardBody className="p-4">
            <SkeletonLine lines={1} className="h-10 mb-4" />
            <SkeletonLine lines={6} className="h-12 mb-2" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
