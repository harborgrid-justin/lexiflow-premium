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

// ML Engine
import { MLEngineModule } from './ml-engine/ml-engine.module';

// Risk Assessment
import { RiskAssessmentModule } from './risk-assessment/risk-assessment.module';
import { RiskAssessmentController } from './risk-assessment/risk-assessment.controller';

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
    MLEngineModule,
    RiskAssessmentModule,
  ],
  controllers: [
    CaseAnalyticsController,
    JudgeStatsController,
    OutcomePredictionsController,
    DiscoveryAnalyticsController,
    BillingAnalyticsController,
    DashboardController,
    RiskAssessmentController,
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
    MLEngineModule,
    RiskAssessmentModule,
  ],
})
export class AnalyticsModule {}
