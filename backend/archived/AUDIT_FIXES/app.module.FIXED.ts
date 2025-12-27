import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as MasterConfig from './config/master.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import * as path from 'path';
import configuration from './config/configuration';
import resourceLimitsConfig from './config/resource-limits.config';
import { getDatabaseConfig } from './config/database.config';
import { validationSchema, validationOptions } from './config/env.validation';

// Core Modules
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// Health & Monitoring
import { HealthModule } from './health/health.module';

// Real-time Communication
import { RealtimeModule } from './realtime/realtime.module';

// Enterprise Infrastructure - Middleware
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { SanitizationMiddleware } from './common/middleware/sanitization.middleware';

// Enterprise Infrastructure - Interceptors
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

// Enterprise Infrastructure - Filters
import { EnterpriseExceptionFilter } from './common/filters/enterprise-exception.filter';

// All other module imports...
import { CasesModule } from './cases/cases.module';
import { PartiesModule } from './parties/parties.module';
import { CaseTeamsModule } from './case-teams/case-teams.module';
import { CasePhasesModule } from './case-phases/case-phases.module';
import { MotionsModule } from './motions/motions.module';
import { DocketModule } from './docket/docket.module';
import { ProjectsModule } from './projects/projects.module';
import { MattersModule } from './matters/matters.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { DocumentsModule } from './documents/documents.module';
import { DocumentVersionsModule } from './document-versions/document-versions.module';
import { ClausesModule } from './clauses/clauses.module';
import { PleadingsModule } from './pleadings/pleadings.module';
import { OcrModule } from './ocr/ocr.module';
import { ProcessingJobsModule } from './processing-jobs/processing-jobs.module';
import { DraftingModule } from './drafting/drafting.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { ProductionModule } from './production/production.module';
import { EvidenceModule } from './evidence/evidence.module';
import { BillingModule } from './billing/billing.module';
import { ComplianceModule } from './compliance/compliance.module';
import { CommunicationsModule } from './communications/communications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { ReportsModule } from './reports/reports.module';
import { MetricsModule } from './metrics/metrics.module';
import { GraphQLModule } from './graphql/graphql.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
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
import { SchemaManagementModule } from './schema-management/schema-management.module';
import { QueryWorkbenchModule } from './query-workbench/query-workbench.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { SyncModule } from './sync/sync.module';
import { BackupsModule } from './backups/backups.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AiOpsModule } from './ai-ops/ai-ops.module';
import { AiDataopsModule } from './ai-dataops/ai-dataops.module';
import { VersioningModule } from './versioning/versioning.module';
import { QueuesModule } from './queues/queues.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Determine if Redis/Bull should be enabled
const isRedisEnabled = process.env.REDIS_ENABLED !== 'false' && process.env.DEMO_MODE !== 'true';

// Conditionally include Bull module
const conditionalImports: any[] = [];
if (isRedisEnabled) {
  conditionalImports.push(
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('redis.url');
        if (redisUrl) {
          return { url: redisUrl };
        }
        return {
          redis: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
            password: configService.get('redis.password'),
            username: configService.get('redis.username'),
          },
        };
      },
    }),
  );
} else {
  console.log('📦 Bull/Redis disabled - running in demo mode');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../.env'),
      load: [configuration, resourceLimitsConfig],
      validationSchema,
      validationOptions,
      cache: true,
      expandVariables: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    ...conditionalImports,

    ScheduleModule.forRoot(),

    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),

    ThrottlerModule.forRoot([{
      ttl: MasterConfig.RATE_LIMIT_TTL,
      limit: MasterConfig.RATE_LIMIT_LIMIT,
    }]),

    CommonModule,
    DatabaseModule,
    HealthModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    CasesModule,
    PartiesModule,
    CaseTeamsModule,
    CasePhasesModule,
    MotionsModule,
    DocketModule,
    ProjectsModule,
    MattersModule,
    FileStorageModule,
    DocumentsModule,
    DocumentVersionsModule,
    ClausesModule,
    PleadingsModule,
    OcrModule,
    ProcessingJobsModule,
    DraftingModule,
    DiscoveryModule,
    ProductionModule,
    EvidenceModule,
    BillingModule,
    ComplianceModule,
    CommunicationsModule,
    AnalyticsModule,
    SearchModule,
    ReportsModule,
    MetricsModule,
    GraphQLModule,
    IntegrationsModule,
    WebhooksModule,
    ApiKeysModule,
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
    JurisdictionsModule,
    KnowledgeModule,
    LegalEntitiesModule,
    SchemaManagementModule,
    QueryWorkbenchModule,
    PipelinesModule,
    SyncModule,
    BackupsModule,
    MonitoringModule,
    AiOpsModule,
    AiDataopsModule,
    VersioningModule,
    QueuesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Global Interceptors - ORDER MATTERS!
    // 1. Correlation ID - Must be first to generate ID for all other interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
    // 2. Logging - Needs correlation ID from step 1
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // 3. Timeout - Should wrap the actual handler
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new TimeoutInterceptor(MasterConfig.REQUEST_TIMEOUT_MS),
    },
    // 4. Response Transform - Should be last to transform final response
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },

    // Global Filters
    {
      provide: APP_FILTER,
      useClass: EnterpriseExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Middleware execution order - CRITICAL for proper request processing

    // 1. Request ID Generation - MUST be first
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');

    // 2. Sanitization - Apply after ID generation, before business logic
    consumer
      .apply(SanitizationMiddleware)
      .exclude(
        // Exclude endpoints that handle raw data or have their own validation
        { path: 'health', method: RequestMethod.GET },
        { path: 'api/docs', method: RequestMethod.ALL },
        { path: 'api/docs/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
