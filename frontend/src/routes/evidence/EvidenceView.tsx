/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Evidence Management Domain - View Component
 * Enterprise React Architecture Pattern
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { CheckCircle, Clock, Shield, Tag } from 'lucide-react';
import React, { useId } from 'react';
import { useEvidence } from './hooks/useEvidence';

export function EvidenceView() {
  const {
    evidence,
    metrics,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    isPending
  } = useEvidence();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Evidence Vault"
        subtitle="Secure evidence management and chain of custody tracking"
        actions={
          <Button variant="primary" size="md">
            <Shield className="w-4 h-4" />
            Add Evidence
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Items"
          value={metrics.total}
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Reviewed"
          value={metrics.reviewed}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Pending"
          value={metrics.pending}
        />
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor={searchId} className="sr-only">Search evidence</label>
            <input
              id={searchId}
              type="search"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Archived">Archived</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="Document">Document</option>
            <option value="Photo">Photo</option>
            <option value="Video">Video</option>
            <option value="Audio">Audio</option>
            <option value="Physical">Physical</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <div className="space-y-3">
            {evidence.map(item => (
              <EvidenceCard key={item.id} evidence={item} />
            ))}
            {evidence.length === 0 && (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                No evidence found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sub-components
 */

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

type EvidenceItem = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  tags: string[];
  custodian?: string;
  collectedDate: string;
  location?: string;
};

function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-white mb-1">
            {evidence.title}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {evidence.description}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${evidence.status === 'Reviewed'
          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
          : evidence.status === 'Pending'
            ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
          {evidence.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
          {evidence.type}
        </span>
        {evidence.custodian && (
          <span>Custodian: {evidence.custodian}</span>
        )}
        <span>Collected: {new Date(evidence.collectedDate).toLocaleDateString()}</span>
      </div>

      {evidence.tags && evidence.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {evidence.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
