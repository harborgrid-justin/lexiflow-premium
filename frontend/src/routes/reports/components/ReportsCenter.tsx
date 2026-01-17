/**
 * Reports & Analytics Domain - View Component
 *
 * ENTERPRISE ARCHITECTURE:
 * - Pure presentation component
 * - Receives data via props only
 * - No direct data fetching
 * - Emits events upward
 *
 * @module routes/reports/components/ReportsCenter
 */

import { Plus } from 'lucide-react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';

import { ReportFilters } from './ReportFilters';
import { ReportStats } from './ReportStats';
import { ReportTable } from './ReportTable';

import type { Report } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ReportsCenterProps {
  /** Reports to display */
  reports: Report[];
  /** Recently accessed reports */
  recentReports: Report[];
  /** Current search term */
  searchTerm: string;
  /** Current type filter */
  typeFilter: string;
  /** Callback when search term changes */
  onSearchChange: (term: string) => void;
  /** Callback when type filter changes */
  onTypeFilterChange: (type: string) => void;
  /** Loading state */
  isPending?: boolean;
  /** Callback when creating new report */
  onCreateReport?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReportsCenter({
  reports,
  recentReports,
  searchTerm,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
  isPending = false,
  onCreateReport
}: ReportsCenterProps) {
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business intelligence and data visualization"
        actions={
          <Button variant="primary" size="md" onClick={onCreateReport}>
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        }
      />

      <ReportStats
        totalReports={reports.length}
        recentReports={recentReports.length}
        scheduledReports={reports.filter(r => r.schedule).length}
      />

      <ReportFilters
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        onSearchChange={onSearchChange}
        onTypeFilterChange={onTypeFilterChange}
      />

      <ReportTable reports={reports} isPending={isPending} />
    </div>
  );
}
