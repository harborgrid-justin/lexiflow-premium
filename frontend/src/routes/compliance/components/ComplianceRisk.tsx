import { Button } from '@/shared/ui/atoms/Button/Button';
import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';
import { AlertTriangle, FileText, Loader2, ShieldAlert } from 'lucide-react';
import { memo } from 'react';
import { useComplianceRisk } from './hooks/useComplianceRisk';

interface ComplianceRiskMetrics {
   high: number;
   violations: number;
   missingDocs?: number;
}

export const ComplianceRisk = memo(() => {
   const [{ metrics, status }, { refresh }] = useComplianceRisk();

   if (status === 'loading') {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>
   }

   if (status === 'error') {
      return (
         <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
            <p className="text-red-500">Failed to load risk data</p>
            <Button onClick={refresh} variant="primary">Retry</Button>
         </div>
      );
   }

   const riskMetrics = metrics as unknown as ComplianceRiskMetrics;
   const missingDocs = riskMetrics?.missingDocs || 0;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
         <MetricCard
            label="High Risk Clients"
            value={metrics?.high || 0}
            icon={ShieldAlert}
            className="border-l-4 border-l-rose-500"
         />
         <MetricCard
            label="Missing Engagement Letters"
            value={missingDocs}
            icon={FileText}
            className="border-l-4 border-l-amber-500"
         />
         <MetricCard
            label="Data Policy Violations"
            value={metrics?.violations || 0}
            icon={AlertTriangle}
            className="border-l-4 border-l-blue-500"
         />
      </div>
   );
});

ComplianceRisk.displayName = 'ComplianceRisk';
