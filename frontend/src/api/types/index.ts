/**
 * API Types Index - Mock Data Barrel Export
 *
 * @deprecated ALL EXPORTS ARE MOCK DATA - DO NOT IMPORT DIRECTLY IN PRODUCTION CODE
 *
 * This file re-exports mock data constants used for:
 * - Development seeding
 * - Testing fixtures
 * - Storybook stories
 * - API documentation
 *
 * **PRODUCTION CODE SHOULD USE:**
 * - `DataService` facade for all data operations (automatically routes to backend API)
 * - `queryKeys` for React Query cache key management
 * - Backend REST APIs via `services/api/index.ts`
 *
 * **Architecture Note (as of 2025-12-18):**
 * LexiFlow uses a backend-first architecture with PostgreSQL + NestJS.
 * Frontend defaults to REST API calls. Legacy IndexedDB mode is deprecated.
 *
 * @see {@link ../../../services/data/dataService.ts} - Data access facade
 * @see {@link ../../../services/api/index.ts} - Backend API services
 * @see {@link ../../../../backend/src} - NestJS backend source
 */

// =============================================================================
// TYPE DEFINITIONS (Public API - Not Deprecated)
// =============================================================================

// Federal Court Hierarchy Types
export type {
  CourtNode,
  StateJurisdiction,
  StateJurisdictionLevel,
} from "./federalHierarchy";

// Litigation Playbook Types
export type {
  AuthorityType,
  LinkedAuthority,
  Playbook,
  PlaybookDifficulty,
  PlaybookStage,
  WarRoomConfig,
} from "@/types/playbook";

// =============================================================================
// MOCK DATA CONSTANTS (Deprecated - Use DataService)
// =============================================================================

// Data files - Federal hierarchy and structured data
export {
  FEDERAL_CIRCUITS,
  STATE_JURISDICTIONS,
  getCourtHierarchy,
} from "./federalHierarchy";
export { MOCK_API_SPEC } from "./mockApiSpec";
export {
  HIERARCHY_USERS,
  MOCK_GROUPS as MOCK_GROUPS_HIERARCHY,
  MOCK_ORGS as MOCK_ORGS_HIERARCHY,
} from "./mockHierarchy";
export {
  MOCK_PRECEDENTS,
  MOCK_QA_ITEMS,
  MOCK_WIKI_ARTICLES,
} from "./mockKnowledge";
export { MOCK_MOTIONS } from "./mockMotions";
export { TEMPLATE_LIBRARY } from "./workflowTemplates";

// Core domain models - Case, Documents, Users
export { MOCK_CASES } from "./case";
export { MOCK_CLAUSES } from "./clause";
export { MOCK_CLIENTS } from "./client";
export { MOCK_DOCKET_ENTRIES } from "./docketEntry";
export { MOCK_DOCUMENTS } from "./document";
export { MOCK_GROUPS } from "./group";
export { MOCK_INVOICES } from "./invoice";
export { MOCK_ORGS } from "./organization";
export { MOCK_TIME_ENTRIES } from "./timeEntry";
export { MOCK_USERS } from "./user";

// Trial and Litigation
export { MOCK_ADVISORS } from "./advisor";
export { MOCK_CONFERRALS } from "./conferralSession";
export { MOCK_EVIDENCE } from "./evidenceItem";
export { MOCK_EXHIBITS } from "./exhibit";
export { MOCK_JUDGES } from "./judgeProfile";
export { MOCK_COUNSEL } from "./opposingCounselProfile";
export { MOCK_OPPOSITION } from "./opposition";
export { PLEADING_TEMPLATES } from "./pleadingTemplate";
export { MOCK_STIPULATIONS } from "./stipulationRequest";

// Discovery
export {
  MOCK_DISCOVERY_CUSTODIANS,
  MOCK_DISCOVERY_FUNNEL,
} from "./discoveryCharts";
export { MOCK_DISCOVERY_DOCS } from "./discoveryDoc";
export {
  MOCK_INTERVIEWS as MOCK_CUSTODIAN_INTERVIEWS,
  MOCK_DEPOSITIONS,
  MOCK_ESI_SOURCES,
  MOCK_PRODUCTIONS as MOCK_PRODUCTION_SETS,
} from "./discoveryExtended";
export { MOCK_DISCOVERY } from "./discoveryRequest";
export { MOCK_JOINT_PLANS } from "./jointPlan";
export { MOCK_LEGAL_HOLDS } from "./legalHold";
export { MOCK_PRIVILEGE_LOG } from "./privilegeLogEntry";

// Compliance and Security
export { MOCK_AUDIT_LOGS } from "./auditLogEntry";
export { MOCK_CONFLICTS } from "./conflictCheck";
export { MOCK_WALLS } from "./ethicalWall";
export { MALWARE_SIGNATURES } from "./security";

// Analytics and Statistics
export { MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from "./analyticsStats";
export {
  MOCK_OPERATING_SUMMARY,
  MOCK_REALIZATION_DATA,
  MOCK_WIP_DATA,
} from "./billingStats";
export {
  DASHBOARD_CHART_DATA,
  DASHBOARD_STATS,
  RECENT_ALERTS,
} from "./dashboardData";
export { MOCK_METRICS } from "./marketingMetric";

// Knowledge and Resources
export { MOCK_DATA_DICTIONARY } from "./dataDictionary";
export { MOCK_RULES } from "./legalRule";
export { MOCK_PLAYBOOKS } from "./playbook";

// Communications
export { MOCK_CONVERSATIONS } from "./conversation";

// CRM and Marketing
export { MOCK_CRM_ANALYTICS, MOCK_LEADS } from "./crm";

// HR and Staff
export { MOCK_CLE_TRACKING } from "./cle";
export { MOCK_STAFF } from "./staffMember";
// Operations and Facilities
export { MOCK_FACILITIES } from "./facility";
export { MOCK_EXPENSES } from "./firmExpense";
export { BUSINESS_PROCESSES } from "./firmProcess";
export { MOCK_MAINTENANCE_TICKETS } from "./maintenanceTicket";
export { MOCK_REPORTERS } from "./reporters";
export { MOCK_RFPS } from "./rfp";
export { MOCK_VENDOR_CONTRACTS } from "./vendorContract";
export { MOCK_VENDOR_DIRECTORY } from "./vendorDirectory";

// Strategic Planning
export { MOCK_OKRS } from "./strategy";

// Jurisdiction
export { MOCK_JURISDICTIONS } from "./jurisdiction";

// Workflow
export { MOCK_STAGES } from "./workflowStage";
export { MOCK_TASKS } from "./workflowTask";

// Note: filters and dto moved to @/types package
// export * from './filters';
// export * from './dto';
