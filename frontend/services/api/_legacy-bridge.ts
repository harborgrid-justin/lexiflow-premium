/**
 * ALL REMAINING API SERVICES - CONSOLIDATED MIGRATION
 * 
 * This file consolidates ALL services from the legacy files into properly organized domains.
 * After this migration, legacy files can be deleted.
 */

// Re-export all existing consolidated services
export * from './auth-api';
export * from './users-api';
export * from './api-keys-api';
export * from './cases-api';
export * from './docket-api';
export * from './documents-api';
export * from './evidence-api';
export * from './custodians-api';
export * from './examinations-api';
export * from './billing-api';
export * from './billing/time-entries-api';
export * from './billing/invoices-api';
export * from './billing/expenses-api';
export * from './fee-agreements-api';
export * from './rate-tables-api';
export * from './integrations/pacer-api';
export * from './webhooks-api';
export * from './search/search-api';
export * from './admin/processing-jobs-api';
export * from './notifications-api';

// Re-export api object from index.ts
export { api } from './index';

// Import all legacy services that need to stay temporarily
import { 
  extendedApiServices 
} from '../apiServicesExtended';

import { 
  discoveryApiServices 
} from '../apiServicesDiscovery';

import { 
  complianceApiServices 
} from '../apiServicesCompliance';

import { 
  additionalApiServices 
} from '../apiServicesAdditional';

import { 
  finalApiServices 
} from '../apiServicesFinal';

// Re-export all legacy services through the new API structure
// This maintains backward compatibility while we complete the migration
export const legacyApi = {
  // Extended Services
  trustAccounts: extendedApiServices.trustAccounts,
  billingAnalytics: extendedApiServices.billingAnalytics,
  reports: extendedApiServices.reports,
  pleadings: extendedApiServices.pleadings,
  motions: extendedApiServices.motions,
  clauses: extendedApiServices.clauses,
  casePhases: extendedApiServices.casePhases,
  caseTeams: extendedApiServices.caseTeams,
  parties: extendedApiServices.parties,
  
  // Discovery Services
  legalHolds: discoveryApiServices.legalHolds,
  depositions: discoveryApiServices.depositions,
  discoveryRequests: discoveryApiServices.discoveryRequests,
  esiSources: discoveryApiServices.esiSources,
  privilegeLog: discoveryApiServices.privilegeLog,
  productions: discoveryApiServices.productions,
  custodianInterviews: discoveryApiServices.custodianInterviews,
  
  // Compliance Services
  conflictChecks: complianceApiServices.conflictChecks,
  ethicalWalls: complianceApiServices.ethicalWalls,
  auditLogs: complianceApiServices.auditLogs,
  permissions: complianceApiServices.permissions,
  rlsPolicies: complianceApiServices.rlsPolicies,
  complianceReports: complianceApiServices.complianceReports,
  
  // Additional Services
  projects: additionalApiServices.projects,
  communications: additionalApiServices.communications,
  
  // Final Services
  hr: finalApiServices.hr,
  workflowTemplates: finalApiServices.workflowTemplates,
  trial: finalApiServices.trial,
  knowledgeBase: finalApiServices.knowledgeBase,
  tasks: finalApiServices.tasks,
  risks: finalApiServices.risks,
  exhibits: finalApiServices.exhibits,
  clients: finalApiServices.clients,
  citations: finalApiServices.citations,
  messenger: finalApiServices.messenger,
  calendar: finalApiServices.calendar,
  warRoom: finalApiServices.warRoom,
  analyticsDashboard: finalApiServices.analyticsDashboard,
};
