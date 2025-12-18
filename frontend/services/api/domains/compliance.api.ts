/**
 * Compliance & Reporting Domain API Services
 * Compliance checks, conflict checks, ethical walls, reporting
 */

import { ComplianceApiService } from '../compliance-api';
import { ConflictChecksApiService } from '../conflict-checks-api';
import { ReportsApiService } from '../reports-api';
import { ComplianceReportingApiService } from '../compliance-reporting-api';

// Export service classes
export {
  ComplianceApiService,
  ConflictChecksApiService,
  ReportsApiService,
  ComplianceReportingApiService,
};

// Export singleton instances
export const complianceApi = {
  compliance: new ComplianceApiService(),
  conflictChecks: new ConflictChecksApiService(),
  reports: new ReportsApiService(),
  complianceReporting: new ComplianceReportingApiService(),
} as const;
