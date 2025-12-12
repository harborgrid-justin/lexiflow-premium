import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';

// Core Modules
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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

// Integration Modules
import { GraphqlModule } from './graphql/graphql.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ApiKeysModule } from './api-keys/api-keys.module';

// Real-time Communication
import { WebSocketModule } from './websocket/websocket.module';

// App Controller & Service
import { AppController } from './app.controller';
import { AppService } from './app.service';

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

    // Bull Queue (Redis-based)
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

    // Scheduler for cron jobs
    ScheduleModule.forRoot(),

    // Core Infrastructure Modules
    CommonModule,
    DatabaseModule,

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

    // Integration & APIs
    GraphqlModule,
    IntegrationsModule,
    WebhooksModule,
    ApiKeysModule,

    // Real-time Communication
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
