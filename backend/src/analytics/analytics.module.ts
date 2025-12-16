import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';

// Import BillingModule to access real billing analytics
import { BillingModule } from '../billing/billing.module';

// Main service
import { AnalyticsService } from './analytics.service';

// Case Analytics
import { CaseAnalyticsController } from './case-analytics/case-analytics.controller';
import { CaseAnalyticsService } from './case-analytics/case-analytics.service';

// Judge Statistics
import { JudgeStatsController } from './judge-stats/judge-stats.controller';
import { JudgeStatsService } from './judge-stats/judge-stats.service';

// Outcome Predictions
import { OutcomePredictionsController } from './outcome-predictions/outcome-predictions.controller';
import { OutcomePredictionsService } from './outcome-predictions/outcome-predictions.service';

// Discovery Analytics
import { DiscoveryAnalyticsController } from './discovery-analytics/discovery-analytics.controller';
import { DiscoveryAnalyticsService } from './discovery-analytics/discovery-analytics.service';

// Billing Analytics
import { BillingAnalyticsController } from './billing-analytics/billing-analytics.controller';
import { BillingAnalyticsService } from './billing-analytics/billing-analytics.service';

// Dashboard
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsEvent, Dashboard]),
    BillingModule, // Import BillingModule to access BillingAnalyticsService
  ],
  controllers: [
    CaseAnalyticsController,
    JudgeStatsController,
    OutcomePredictionsController,
    DiscoveryAnalyticsController,
    BillingAnalyticsController,
    DashboardController,
  ],
  providers: [
    // Main Service
    AnalyticsService,
    
    CaseAnalyticsService,
    JudgeStatsService,
    OutcomePredictionsService,
    DiscoveryAnalyticsService,
    BillingAnalyticsService,
    DashboardService,
  ],
  exports: [
    // Export main service
    AnalyticsService,
    
    CaseAnalyticsService,
    JudgeStatsService,
    OutcomePredictionsService,
    DiscoveryAnalyticsService,
    BillingAnalyticsService,
    DashboardService,
  ],
})
export class AnalyticsModule {}
