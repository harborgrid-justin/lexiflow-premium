/**
 * Compliance & Reporting Domain API Services
 * Compliance checks, conflict checks, ethical walls, reporting
 */

import { ComplianceApiService } from '@/api';
import { ConflictChecksApiService } from '@/api';
import { ReportsApiService } from '@/api';
import { ComplianceReportingApiService } from '@/api';

// Export singleton instances
export const complianceApi = {
  compliance: new ComplianceApiService(),
  conflictChecks: new ConflictChecksApiService(),
  reports: new ReportsApiService(),
  complianceReporting: new ComplianceReportingApiService(),
} as const;
