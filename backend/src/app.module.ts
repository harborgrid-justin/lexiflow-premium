import { Module, DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';

// Core Modules
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// Health & Monitoring
import { HealthModule } from './health/health.module';

// Real-time Communication
import { RealtimeModule } from './realtime/realtime.module';

// Enterprise Infrastructure
import { SanitizationMiddleware } from './common/middleware/sanitization.middleware';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { EnterpriseExceptionFilter } from './common/filters/enterprise-exception.filter';

// Case Management Modules
import { CasesModule } from './cases/cases.module';
import { PartiesModule } from './parties/parties.module';
import { CaseTeamsModule } from './case-teams/case-teams.module';
import { CasePhasesModule } from './case-phases/case-phases.module';
import { MotionsModule } from './motions/motions.module';
import { DocketModule } from './docket/docket.module';
import { ProjectsModule } from './projects/projects.module';

// Document Management Modules
import { FileStorageModule } from './file-storage/file-storage.module';
import { DocumentsModule } from './documents/documents.module';
import { DocumentVersionsModule } from './document-versions/document-versions.module';
import { ClausesModule } from './clauses/clauses.module';
import { PleadingsModule } from './pleadings/pleadings.module';
import { OcrModule } from './ocr/ocr.module';
import { ProcessingJobsModule } from './processing-jobs/processing-jobs.module';

// Discovery Module
import { DiscoveryModule } from './discovery/discovery.module';

// Billing Modules
import { BillingModule } from './billing/billing.module';

// Compliance Modules
import { ComplianceModule } from './compliance/compliance.module';

// Communications Modules
import { CommunicationsModule } from './communications/communications.module';

// Analytics & Search Modules
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { ReportsModule } from './reports/reports.module';
import { MetricsModule } from './metrics/metrics.module';

// Integration Modules
import { GraphQLModule } from './graphql/graphql.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ApiKeysModule } from './api-keys/api-keys.module';

// New Service Modules - Final 13
import { TasksModule } from './tasks/tasks.module';
import { RisksModule } from './risks/risks.module';
import { HRModule } from './hr/hr.module';
import { WorkflowModule } from './workflow/workflow.module';
import { TrialModule } from './trial/trial.module';
import { ExhibitsModule } from './exhibits/exhibits.module';
import { ClientsModule } from './clients/clients.module';
import { CitationsModule } from './citations/citations.module';
import { CalendarModule } from './calendar/calendar.module';
import { MessengerModule } from './messenger/messenger.module';
import { WarRoomModule } from './war-room/war-room.module';
import { AnalyticsDashboardModule } from './analytics-dashboard/analytics-dashboard.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

// App Controller & Service
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
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
    }),
  );
} else {
  console.log('📦 Bull/Redis disabled - running in demo mode');
}

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Conditionally load Bull/Redis
    ...conditionalImports,

    // Scheduler for cron jobs
    ScheduleModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // Core Infrastructure Modules
    CommonModule,
    DatabaseModule,

    // Health Monitoring
    HealthModule,

    // Real-time Updates
    RealtimeModule,

    // Authentication & Authorization
    AuthModule,
    UsersModule,

    // Case Management System
    CasesModule,
    PartiesModule,
    CaseTeamsModule,
    CasePhasesModule,
    MotionsModule,
    DocketModule,
    ProjectsModule,

    // Document Management System
    FileStorageModule,
    DocumentsModule,
    DocumentVersionsModule,
    ClausesModule,
    PleadingsModule,
    OcrModule,
    ProcessingJobsModule,

    // Discovery & E-Discovery
    DiscoveryModule,

    // Billing & Finance
    BillingModule,

    // Compliance & Audit
    ComplianceModule,

    // Communications
    CommunicationsModule,

    // Analytics, Search & Reporting
    AnalyticsModule,
    SearchModule,
    ReportsModule,
    MetricsModule,

    // Integration & APIs
    GraphQLModule,
    IntegrationsModule,
    WebhooksModule,
    ApiKeysModule,

    // Final 13 Services - Completing 100% Backend Coverage
    TasksModule,
    RisksModule,
    HRModule,
    WorkflowModule,
    TrialModule,
    ExhibitsModule,
    ClientsModule,
    CitationsModule,
    CalendarModule,
    MessengerModule,
    WarRoomModule,
    AnalyticsDashboardModule,
    KnowledgeModule,
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
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
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
    consumer
      .apply(SanitizationMiddleware)
      .forRoutes('*');
  }
}
