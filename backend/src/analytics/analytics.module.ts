import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    // TypeOrmModule.forFeature([
    //   Case,
    //   LegalDocument,
    //   TimeEntry,
    //   Invoice,
    //   DiscoveryRequest,
    //   Motion,
    //   Judge,
    //   OutcomePredictionData,
    // ]),
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
    CaseAnalyticsService,
    JudgeStatsService,
    OutcomePredictionsService,
    DiscoveryAnalyticsService,
    BillingAnalyticsService,
    DashboardService,
  ],
  exports: [
    CaseAnalyticsService,
    JudgeStatsService,
    OutcomePredictionsService,
    DiscoveryAnalyticsService,
    BillingAnalyticsService,
    DashboardService,
  ],
})
export class AnalyticsModule {}
