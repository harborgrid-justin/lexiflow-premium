import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { KPIMetric } from './entities/kpi-metric.entity';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';
import { ReportTemplate } from './entities/report-template.entity';
import { ReportExecution } from './entities/report-execution.entity';

// Import BillingModule to access real billing analytics
import { BillingModule } from '@billing/billing.module';
import { AuthModule } from '@auth/auth.module';

// Main service
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

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

// Enterprise Analytics Controller
import { EnterpriseAnalyticsController } from './enterprise-analytics.controller';

// Enterprise Analytics Services
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { FirmAnalyticsService } from './firm-analytics.service';
import { PracticeGroupAnalyticsService } from './practice-group-analytics.service';
import { AttorneyPerformanceService } from './attorney-performance.service';
import { ClientAnalyticsService } from './client-analytics.service';
import { FinancialReportsService } from './financial-reports.service';
import { KPICalculatorService } from './kpi-calculator.service';
import { AnalyticsWebSocketGateway } from './analytics-websocket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      Dashboard,
      DashboardWidget,
      KPIMetric,
      AnalyticsSnapshot,
      ReportTemplate,
      ReportExecution,
    ]),
    BillingModule, // Import BillingModule to access BillingAnalyticsService
    AuthModule,
  ],
  controllers: [
    AnalyticsController,
    CaseAnalyticsController,
    JudgeStatsController,
    OutcomePredictionsController,
    DiscoveryAnalyticsController,
    BillingAnalyticsController,
    DashboardController,
    EnterpriseAnalyticsController,
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

    // Enterprise Analytics Services
    ExecutiveDashboardService,
    FirmAnalyticsService,
    PracticeGroupAnalyticsService,
    AttorneyPerformanceService,
    ClientAnalyticsService,
    FinancialReportsService,
    KPICalculatorService,
    AnalyticsWebSocketGateway,
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

    // Enterprise Analytics Services
    ExecutiveDashboardService,
    FirmAnalyticsService,
    PracticeGroupAnalyticsService,
    AttorneyPerformanceService,
    ClientAnalyticsService,
    FinancialReportsService,
    KPICalculatorService,
  ],
})
export class AnalyticsModule {}
