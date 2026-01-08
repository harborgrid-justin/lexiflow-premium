/**
 * Discovery Request Detail Page
 * Comprehensive view of a single discovery request
 *
 * Next.js 16 Compliance:
 * - Async params handling
 * - Suspense boundaries for streaming
 * - generateMetadata with async params
 *
 * @module discovery/[id]/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardBody, Badge, Button, SkeletonLine } from '@/components/ui';
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Send,
  Shield,
  Scale,
  Eye,
  Upload,
} from 'lucide-react';
import { getDiscoveryRequest, getCustodians, getCollections } from '../_actions';
import { DiscoveryDetailActions } from './_components/DiscoveryDetailActions';
import { DiscoveryTimeline } from './_components/DiscoveryTimeline';
import type { DiscoveryRequestStatusValue } from '../_types';

// ============================================================================
// Metadata
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getDiscoveryRequest(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Discovery Request | LexiFlow',
    };
  }

  return {
    title: `${result.data.title} | Discovery | LexiFlow`,
    description: result.data.description || `Discovery request: ${result.data.title}`,
  };
}

// ============================================================================
// Status Configuration
// ============================================================================

const statusConfig: Record<DiscoveryRequestStatusValue, {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  icon: React.ReactNode;
}> = {
  draft: { label: 'Draft', variant: 'default', icon: <FileText className="h-4 w-4" /> },
  pending: { label: 'Pending', variant: 'warning', icon: <Clock className="h-4 w-4" /> },
  served: { label: 'Served', variant: 'info', icon: <Send className="h-4 w-4" /> },
  responded: { label: 'Responded', variant: 'success', icon: <CheckCircle className="h-4 w-4" /> },
  objected: { label: 'Objected', variant: 'danger', icon: <AlertTriangle className="h-4 w-4" /> },
  completed: { label: 'Completed', variant: 'success', icon: <CheckCircle className="h-4 w-4" /> },
  withdrawn: { label: 'Withdrawn', variant: 'default', icon: <FileText className="h-4 w-4" /> },
};

// ============================================================================
// Page Component
// ============================================================================

export default async function DiscoveryDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const result = await getDiscoveryRequest(resolvedParams.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const request = result.data;
  const status = statusConfig[request.status];
  const daysRemaining = Math.ceil(
    (new Date(request.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/discovery"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discovery
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {request.title}
              </h1>
              <Badge variant={status.variant} className="inline-flex items-center gap-1">
                {status.icon}
                {status.label}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {request.description || 'No description provided'}
            </p>
          </div>

          <DiscoveryDetailActions
            discoveryRequestId={request.id}
            status={request.status}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <QuickStatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Due Date"
          value={new Date(request.dueDate).toLocaleDateString()}
          subtext={daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue'}
          alert={daysRemaining <= 7 && daysRemaining > 0}
          danger={daysRemaining <= 0}
        />
        <QuickStatCard
          icon={<FolderOpen className="h-5 w-5" />}
          label="Documents"
          value={request.documentCount?.toLocaleString() || '0'}
        />
        <QuickStatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Reviewed"
          value={`${request.reviewProgress || 0}%`}
          subtext={`${request.reviewedCount || 0} of ${request.documentCount || 0}`}
        />
        <QuickStatCard
          icon={<Shield className="h-5 w-5" />}
          label="Privileged"
          value={request.privilegedCount?.toLocaleString() || '0'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Request Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  icon={<Scale className="h-4 w-4" />}
                  label="Request Type"
                  value={formatRequestType(request.requestType)}
                />
                <DetailItem
                  icon={<Users className="h-4 w-4" />}
                  label="Propounding Party"
                  value={request.propoundingParty}
                />
                <DetailItem
                  icon={<Users className="h-4 w-4" />}
                  label="Responding Party"
                  value={request.respondingParty}
                />
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Service Date"
                  value={request.serviceDate ? new Date(request.serviceDate).toLocaleDateString() : 'Not served'}
                />
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Response Date"
                  value={request.responseDate ? new Date(request.responseDate).toLocaleDateString() : 'Pending'}
                />
                <DetailItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Case"
                  value={request.caseId}
                />
              </div>
            </CardBody>
          </Card>

          {/* Document Collections */}
          <Suspense fallback={<CollectionsSkeleton />}>
            <CollectionsSection discoveryRequestId={resolvedParams.id} />
          </Suspense>

          {/* Custodians */}
          <Suspense fallback={<CustodiansSkeleton />}>
            <CustodiansSection discoveryRequestId={resolvedParams.id} />
          </Suspense>

          {/* Response/Objections */}
          {request.response && (
            <Card>
              <CardBody>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Response
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300">
                    {request.response}
                  </p>
                </div>
                {request.objections && request.objections.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                      Objections
                    </h3>
                    <ul className="space-y-2">
                      {request.objections.map((objection, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          {objection}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  href={`/discovery/${request.id}/documents`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Manage Documents
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Upload, organize, and search
                    </p>
                  </div>
                </Link>
                <Link
                  href={`/discovery/${request.id}/review`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Eye className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Review Documents
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Code responsiveness and privilege
                    </p>
                  </div>
                </Link>
                <Link
                  href={`/discovery/${request.id}/production`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Download className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Production Sets
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Generate and export productions
                    </p>
                  </div>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Timeline
              </h2>
              <DiscoveryTimeline
                discoveryRequestId={request.id}
                createdAt={request.createdAt}
                serviceDate={request.serviceDate}
                responseDate={request.responseDate}
                dueDate={request.dueDate}
              />
            </CardBody>
          </Card>

          {/* Assigned Team */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Assigned Team
              </h2>
              {request.assignedTo && request.assignedTo.length > 0 ? (
                <div className="space-y-3">
                  {request.assignedTo.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {member.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {member}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No team members assigned
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Server Components
// ============================================================================

async function CollectionsSection({ discoveryRequestId }: { discoveryRequestId: string }) {
  const result = await getCollections(discoveryRequestId);
  const collections = result.success ? result.data || [] : [];

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Document Collections
          </h2>
          <Button size="sm" variant="outline" icon={<Upload className="h-4 w-4" />}>
            New Collection
          </Button>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No collections yet. Start by uploading documents.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {collection.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {collection.documentCount?.toLocaleString() || 0} documents |{' '}
                      {collection.custodian}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    collection.status === 'completed'
                      ? 'success'
                      : collection.status === 'processing'
                        ? 'warning'
                        : 'default'
                  }
                >
                  {collection.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

async function CustodiansSection({ discoveryRequestId }: { discoveryRequestId: string }) {
  const result = await getCustodians(discoveryRequestId);
  const custodians = result.success ? result.data || [] : [];

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Custodians
          </h2>
          <Button size="sm" variant="outline" icon={<Users className="h-4 w-4" />}>
            Add Custodian
          </Button>
        </div>

        {custodians.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No custodians added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {custodians.map((custodian) => (
              <div
                key={custodian.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {custodian.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {custodian.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {custodian.email} | {custodian.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {custodian.legalHoldStatus === 'acknowledged' ? (
                    <Badge variant="success">Hold Acknowledged</Badge>
                  ) : custodian.legalHoldStatus === 'pending' ? (
                    <Badge variant="warning">Hold Pending</Badge>
                  ) : (
                    <Badge variant="default">No Hold</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface QuickStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  alert?: boolean;
  danger?: boolean;
}

function QuickStatCard({ icon, label, value, subtext, alert, danger }: QuickStatCardProps) {
  return (
    <Card className={danger ? 'border-red-300 dark:border-red-700' : alert ? 'border-amber-300 dark:border-amber-700' : ''}>
      <CardBody className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${
          danger
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : alert
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className={`font-semibold ${
            danger
              ? 'text-red-600 dark:text-red-400'
              : alert
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-900 dark:text-white'
          }`}>
            {value}
          </p>
          {subtext && (
            <p className={`text-xs ${
              danger
                ? 'text-red-500'
                : alert
                  ? 'text-amber-500'
                  : 'text-slate-500'
            }`}>
              {subtext}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function formatRequestType(type: string): string {
  const typeMap: Record<string, string> = {
    interrogatories: 'Interrogatories',
    production: 'Request for Production',
    admission: 'Request for Admission',
    deposition: 'Deposition Notice',
    subpoena: 'Subpoena',
  };
  return typeMap[type] || type;
}

// ============================================================================
// Skeleton Components
// ============================================================================

function CollectionsSkeleton() {
  return (
    <Card>
      <CardBody>
        <SkeletonLine lines={1} className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          <SkeletonLine lines={3} className="h-16" />
        </div>
      </CardBody>
    </Card>
  );
}

function CustodiansSkeleton() {
  return (
    <Card>
      <CardBody>
        <SkeletonLine lines={1} className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <SkeletonLine lines={3} className="h-16" />
        </div>
      </CardBody>
    </Card>
  );
}
