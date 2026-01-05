/**
 * Compliance & Reporting Domain API Services
 * Compliance checks, conflict checks, ethical walls, reporting
 */

import { ComplianceApiService } from '../compliance/compliance-api';
import { ConflictChecksApiService } from '../compliance/conflict-checks-api';
import { ReportsApiService } from '../compliance/reports-api';
import { ComplianceReportingApiService } from '../compliance/compliance-reporting-api';

// Export singleton instances
export const complianceApi = {
  compliance: new ComplianceApiService(),
  conflictChecks: new ConflictChecksApiService(),
  reports: new ReportsApiService(),
  complianceReporting: new ComplianceReportingApiService(),
} as const;
