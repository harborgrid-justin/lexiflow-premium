/**
 * @module components/compliance/ComplianceRisk
 * @category Compliance
 * @description Risk metrics dashboard for compliance monitoring.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, FileText, ShieldAlert } from 'lucide-react';
import { memo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Components
import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';

// ============================================================================
// COMPONENT
// ============================================================================
const ComplianceRiskComponent = () => {
   // Use server state management instead of manual fetch
   const { data: metrics = { high: 0, missingDocs: 0, violations: 0 } } = useQuery<{ high: number; missingDocs: number; violations: number }>(
      ['compliance', 'riskMetrics'],
      () => DataService.compliance.getRiskMetrics() as Promise<{ high: number; missingDocs: number; violations: number }>
   );

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <MetricCard
            label="High Risk Clients"
            value={metrics.high}
            icon={ShieldAlert}
            className="border-l-4 border-l-rose-500"
         />
         <MetricCard
            label="Missing Engagement Letters"
            value={metrics.missingDocs}
            icon={FileText}
            className="border-l-4 border-l-amber-500"
         />
         <MetricCard
            label="Data Policy Violations"
            value={metrics.violations}
            icon={AlertTriangle}
            className="border-l-4 border-l-blue-500"
         />
      </div>
   );
}
export const ComplianceRisk = memo(ComplianceRiskComponent);
ComplianceRisk.displayName = 'ComplianceRisk';
