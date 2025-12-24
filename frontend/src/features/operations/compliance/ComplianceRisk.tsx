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
import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, ShieldAlert } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';

// Components
import { MetricCard } from '../../components/atoms';

// ============================================================================
// COMPONENT
// ============================================================================
export const ComplianceRisk: React.FC = () => {
  const [metrics, setMetrics] = useState({ high: 0, missingDocs: 0, violations: 0 });

  useEffect(() => {
      const load = async () => {
          const data = await DataService.compliance.getRiskMetrics();
          setMetrics(data);
      };
      load();
  }, []);

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
};

