// src/app.imports.ts

// Authentication & Users
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Case Management
import { CasesModule } from './cases/cases.module';
import { PartiesModule } from './parties/parties.module';
import { CaseTeamsModule } from './case-teams/case-teams.module';
import { CasePhasesModule } from './case-phases/case-phases.module';
import { MotionsModule } from './motions/motions.module';
import { DocketModule } from './docket/docket.module';
import { ProjectsModule } from './projects/projects.module';
import { MattersModule } from './matters/matters.module';

// Document Management
import { FileStorageModule } from './file-storage/file-storage.module';
import { DocumentsModule } from './documents/documents.module';
import { DocumentVersionsModule } from './document-versions/document-versions.module';
import { ClausesModule } from './clauses/clauses.module';
import { PleadingsModule } from './pleadings/pleadings.module';
import { OcrModule } from './ocr/ocr.module';
import { ProcessingJobsModule } from './processing-jobs/processing-jobs.module';
import { DraftingModule } from './drafting/drafting.module';

// Discovery
import { DiscoveryModule } from './discovery/discovery.module';
import { ProductionModule } from './production/production.module';
import { EvidenceModule } from './evidence/evidence.module';

// Billing & Communications
import { BillingModule } from './billing/billing.module';
import { CommunicationsModule } from './communications/communications.module';

// Analytics & Search
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { ReportsModule } from './reports/reports.module';
import { MetricsModule } from './metrics/metrics.module';

// Integrations & APIs
import { GraphQLModule } from './graphql/graphql.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ApiKeysModule } from './api-keys/api-keys.module';

// Core Business Services
import { TasksModule } from './tasks/tasks.module';
import { RisksModule } from './risks/risks.module';
import { HRModule } from './hr/hr.module';
import { WorkflowModule } from './workflow/workflow.module';
import { TrialModule } from './trial/trial.module';
import { ExhibitsModule } from './exhibits/exhibits.module';
import { ClientsModule } from './clients/clients.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CitationsModule } from './citations/citations.module';
import { BluebookModule } from './bluebook/bluebook.module';
import { CalendarModule } from './calendar/calendar.module';
import { MessengerModule } from './messenger/messenger.module';
import { WarRoomModule } from './war-room/war-room.module';
import { AnalyticsDashboardModule } from './analytics-dashboard/analytics-dashboard.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { JurisdictionsModule } from './jurisdictions/jurisdictions.module';
import { LegalEntitiesModule } from './legal-entities/legal-entities.module';

// Data Platform
import { SchemaManagementModule } from './schema-management/schema-management.module';
import { QueryWorkbenchModule } from './query-workbench/query-workbench.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { SyncModule } from './sync/sync.module';
import { BackupsModule } from './backups/backups.module';
import { AiOpsModule } from './ai-ops/ai-ops.module';
import { AiDataopsModule } from './ai-dataops/ai-dataops.module';
import { VersioningModule } from './versioning/versioning.module';

// Queues & Agents
import { QueuesModule } from './queues/queues.module';
import { EnterpriseAgentsModule } from './enterprise-agents/enterprise-agents.module';

/* ------------------------------------------------------------------ */
/* Canonical Application Module List                                   */
/* ------------------------------------------------------------------ */

export const APP_IMPORTS = [
  // Authentication & Users
  AuthModule,
  UsersModule,

  // Case Management
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
  RisksModule,
  HRModule,
  WorkflowModule,
  TrialModule,
  ExhibitsModule,
  ClientsModule,
  OrganizationsModule,
  CitationsModule,
  BluebookModule,
  CalendarModule,
  MessengerModule,
  WarRoomModule,
  AnalyticsDashboardModule,
  KnowledgeModule,
  JurisdictionsModule,
  LegalEntitiesModule,

  // Data Platform
  SchemaManagementModule,
  QueryWorkbenchModule,
  PipelinesModule,
  SyncModule,
  BackupsModule,
  AiOpsModule,
  AiDataopsModule,
  VersioningModule,

  // Queues & Agents
  QueuesModule,
  EnterpriseAgentsModule,
] as const;

/* ------------------------------------------------------------------ */
/* Derived Metadata (used by startup reporter ONLY)                     */
/* ------------------------------------------------------------------ */

export const APP_IMPORT_NAMES = APP_IMPORTS.map(m => m.name);
