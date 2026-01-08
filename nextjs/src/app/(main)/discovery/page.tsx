/**
 * Discovery Dashboard Page
 * Main e-Discovery management interface with statistics and request list
 *
 * Next.js 16 Compliance:
 * - Async Server Component with proper params handling
 * - Uses Suspense boundaries for streaming
 * - Implements generateMetadata for SEO
 * - Uses "use cache" directive where applicable
 *
 * @module discovery/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody, SkeletonLine } from '@/components/ui';
import { Plus, FileText, FolderOpen, Shield, Package } from 'lucide-react';
import { getDiscoveryRequests, getDiscoveryStatistics } from './_actions';
import {
  DiscoveryStats,
  DiscoveryAlerts,
  DiscoveryRequestTable,
  DiscoveryFilters,
} from './_components';
import type { DiscoveryRequest, DiscoveryStatistics as Stats } from './_types';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Discovery | LexiFlow',
  description: 'Manage e-Discovery processes including legal holds, document collection, review, and production.',
  keywords: ['e-discovery', 'legal hold', 'document review', 'production', 'litigation'],
};

// ============================================================================
// Page Component
// ============================================================================

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
    caseId?: string;
  }>;
}

export default async function DiscoveryPage({ searchParams }: PageProps) {
  // Next.js 16: Await searchParams
  const resolvedParams = await searchParams;

  return (
    <>
      <PageHeader
        title="Discovery"
        description="Manage e-Discovery workflows, legal holds, and document productions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/discovery/new">
              <Button icon={<Plus className="h-4 w-4" />}>New Request</Button>
            </Link>
          </div>
        }
      />

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <QuickNavCard
          href="/legal-holds"
          icon={<Shield className="h-5 w-5" />}
          title="Legal Holds"
          description="Manage preservation holds"
        />
        <QuickNavCard
          href="/custodians"
          icon={<FolderOpen className="h-5 w-5" />}
          title="Custodians"
          description="Track data custodians"
        />
        <QuickNavCard
          href="/production-requests"
          icon={<Package className="h-5 w-5" />}
          title="Productions"
          description="Document productions"
        />
        <QuickNavCard
          href="/depositions"
          icon={<FileText className="h-5 w-5" />}
          title="Depositions"
          description="Schedule depositions"
        />
      </div>

      {/* Statistics */}
      <Suspense fallback={<StatisticsSkeleton />}>
        <StatisticsSection caseId={resolvedParams.caseId} />
      </Suspense>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <DiscoveryFilters />
        </CardBody>
      </Card>

      {/* Discovery Requests Table */}
      <Suspense fallback={<TableSkeleton />}>
        <DiscoveryRequestsSection
          search={resolvedParams.search}
          status={resolvedParams.status}
          type={resolvedParams.type}
          page={resolvedParams.page}
          caseId={resolvedParams.caseId}
        />
      </Suspense>
    </>
  );
}

// ============================================================================
// Server Components for Data Fetching
// ============================================================================

async function StatisticsSection({ caseId }: { caseId?: string }) {
  const result = await getDiscoveryStatistics(caseId);

  if (!result.success || !result.data) {
    return (
      <Card className="mb-6">
        <CardBody>
          <p className="text-red-600 dark:text-red-400">
            Failed to load statistics: {result.error}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <DiscoveryAlerts statistics={result.data} />
      <DiscoveryStats statistics={result.data} />
    </>
  );
}

async function DiscoveryRequestsSection({
  search,
  status,
  type,
  page,
  caseId,
}: {
  search?: string;
  status?: string;
  type?: string;
  page?: string;
  caseId?: string;
}) {
  const result = await getDiscoveryRequests({
    caseId,
    status,
    type,
    page: page ? parseInt(page, 10) : 1,
    pageSize: 20,
  });

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardBody>
          <p className="text-red-600 dark:text-red-400">
            Failed to load discovery requests: {result.error}
          </p>
        </CardBody>
      </Card>
    );
  }

  // Filter by search on client data if API doesn't support it
  let filteredRequests = result.data.items;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRequests = filteredRequests.filter(
      (r) =>
        r.title.toLowerCase().includes(searchLower) ||
        r.propoundingParty.toLowerCase().includes(searchLower) ||
        r.respondingParty.toLowerCase().includes(searchLower)
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Discovery Requests
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {filteredRequests.length} of {result.data.total} requests
        </span>
      </div>
      <DiscoveryRequestTable requests={filteredRequests} />

      {/* Pagination */}
      {result.data.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={result.data.page}
            totalPages={result.data.totalPages}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface QuickNavCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickNavCard({ href, icon, title, description }: QuickNavCardProps) {
  return (
    <Link
      href={href}
      className="block p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center gap-1">
      <Link
        href={`/discovery?page=${Math.max(1, currentPage - 1)}`}
        className={`px-3 py-2 text-sm rounded-md ${
          currentPage === 1
            ? 'text-slate-400 cursor-not-allowed'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        Previous
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          href={`/discovery?page=${page}`}
          className={`px-3 py-2 text-sm rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {page}
        </Link>
      ))}
      <Link
        href={`/discovery?page=${Math.min(totalPages, currentPage + 1)}`}
        className={`px-3 py-2 text-sm rounded-md ${
          currentPage === totalPages
            ? 'text-slate-400 cursor-not-allowed'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        Next
      </Link>
    </nav>
  );
}

// ============================================================================
// Skeleton Components
// ============================================================================

function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardBody>
            <SkeletonLine lines={3} className="h-4" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <CardBody className="p-0">
        <div className="px-6 py-4">
          <SkeletonLine lines={8} className="h-12" />
        </div>
      </CardBody>
    </Card>
  );
}
