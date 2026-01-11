// src/app.imports.ts

// Authentication & Users
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

// Case Management
import { CasePhasesModule } from "./case-phases/case-phases.module";
import { CaseTeamsModule } from "./case-teams/case-teams.module";
import { CasesModule } from "./cases/cases.module";
import { DocketModule } from "./docket/docket.module";
import { MattersModule } from "./matters/matters.module";
import { MotionsModule } from "./motions/motions.module";
import { PartiesModule } from "./parties/parties.module";
import { ProjectsModule } from "./projects/projects.module";

// Document Management
import { ClausesModule } from "./clauses/clauses.module";
import { DocumentVersionsModule } from "./document-versions/document-versions.module";
import { DocumentsModule } from "./documents/documents.module";
import { DraftingModule } from "./drafting/drafting.module";
import { FileStorageModule } from "./file-storage/file-storage.module";
import { OcrModule } from "./ocr/ocr.module";
import { PleadingsModule } from "./pleadings/pleadings.module";
import { ProcessingJobsModule } from "./processing-jobs/processing-jobs.module";

// Discovery
import { DiscoveryModule } from "./discovery/discovery.module";
import { EvidenceModule } from "./evidence/evidence.module";
import { ProductionModule } from "./production/production.module";

// Billing & Communications
import { BillingModule } from "./billing/billing.module";
import { CommunicationsModule } from "./communications/communications.module";

// Analytics & Search
import { AnalyticsModule } from "./analytics/analytics.module";
import { MetricsModule } from "./metrics/metrics.module";
import { ReportsModule } from "./reports/reports.module";
import { SearchModule } from "./search/search.module";

// Integrations & APIs
import { ApiKeysModule } from "./api-keys/api-keys.module";
import { GraphQLModule } from "./graphql/graphql.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

// Core Business Services
import { AnalyticsDashboardModule } from "./analytics-dashboard/analytics-dashboard.module";
import { BluebookModule } from "./bluebook/bluebook.module";
import { CalendarModule } from "./calendar/calendar.module";
import { CitationsModule } from "./citations/citations.module";
import { ClientsModule } from "./clients/clients.module";
import { CrmModule } from "./crm/crm.module";
import { ExhibitsModule } from "./exhibits/exhibits.module";
import { HRModule } from "./hr/hr.module";
import { JurisdictionsModule } from "./jurisdictions/jurisdictions.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { LegalEntitiesModule } from "./legal-entities/legal-entities.module";
import { MessengerModule } from "./messenger/messenger.module";
import { OperationsModule } from "./operations/operations.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { ResearchModule } from "./research/research.module";
import { RisksModule } from "./risks/risks.module";
import { TasksModule } from "./tasks/tasks.module";
import { TrialModule } from "./trial/trial.module";
import { WarRoomModule } from "./war-room/war-room.module";
import { WorkflowModule } from "./workflow/workflow.module";

// Data Platform
import { AiDataopsModule } from "./ai-dataops/ai-dataops.module";
import { AiOpsModule } from "./ai-ops/ai-ops.module";
import { BackupsModule } from "./backups/backups.module";
import { ConnectorsModule } from "./connectors/connectors.module";
import { DataCatalogModule } from "./data-catalog/data-catalog.module";
import { PipelinesModule } from "./pipelines/pipelines.module";
import { QueryWorkbenchModule } from "./query-workbench/query-workbench.module";
import { SchemaManagementModule } from "./schema-management/schema-management.module";
import { SyncModule } from "./sync/sync.module";
import { VersioningModule } from "./versioning/versioning.module";

// Queues & Agents
import { EnterpriseAgentsModule } from "./enterprise-agents/enterprise-agents.module";
import { QueuesModule } from "./queues/queues.module";

// Admin
import { AdminModule } from "./admin/admin.module";

/* ------------------------------------------------------------------ */
/* Canonical Application Module List                                   */
import { StrategiesModule } from "./strategies/strategies.module";

/* ------------------------------------------------------------------ */

export const APP_IMPORTS = [
  // Authentication & Users
  AuthModule,
  UsersModule,

  // Case Management
  StrategiesModule,
  CasesModule,
  PartiesModule,
  CaseTeamsModule,
  CasePhasesModule,
  MotionsModule,
  DocketModule,
  ProjectsModule,
  MattersModule,

  // Document Management
  FileStorageModule,
  DocumentsModule,
  DocumentVersionsModule,
  ClausesModule,
  PleadingsModule,
  OcrModule,
  ProcessingJobsModule,
  DraftingModule,

  // Discovery
  DiscoveryModule,
  ProductionModule,
  EvidenceModule,

  // Billing & Communications
  BillingModule,
  CommunicationsModule,

  // Analytics & Search
  AnalyticsModule,
  SearchModule,
  ReportsModule,
  MetricsModule,

  // Integrations & APIs
  GraphQLModule,
  IntegrationsModule,
  WebhooksModule,
  ApiKeysModule,

  // Core Business Services
  TasksModule,
  OperationsModule,
  RisksModule,
  HRModule,
  WorkflowModule,
  TrialModule,
  ExhibitsModule,
  ClientsModule,
  CrmModule,
  OrganizationsModule,
  CitationsModule,
  BluebookModule,
  CalendarModule,
  MessengerModule,
  WarRoomModule,
  AnalyticsDashboardModule,
  KnowledgeModule,
  ResearchModule,
  JurisdictionsModule,
  LegalEntitiesModule,

  // Data Platform
  DataCatalogModule,
  SchemaManagementModule,
  QueryWorkbenchModule,
  ConnectorsModule,
  PipelinesModule,
  SyncModule,
  BackupsModule,
  AiOpsModule,
  AiDataopsModule,
  VersioningModule,

  // Queues & Agents
  QueuesModule,
  EnterpriseAgentsModule,

  // Admin
  AdminModule,
] as const;

/* ------------------------------------------------------------------ */
/* Derived Metadata (used by startup reporter ONLY)                     */
/* ------------------------------------------------------------------ */

export const APP_IMPORT_NAMES = APP_IMPORTS.map((m) => m.name);
