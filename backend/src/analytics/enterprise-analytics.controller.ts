import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { FirmAnalyticsService } from './firm-analytics.service';
import { PracticeGroupAnalyticsService } from './practice-group-analytics.service';
import { AttorneyPerformanceService } from './attorney-performance.service';
import { ClientAnalyticsService } from './client-analytics.service';
import { FinancialReportsService } from './financial-reports.service';
import { DashboardWidget } from './entities/dashboard-widget.entity';

@ApiTags('enterprise-analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics/enterprise')
export class EnterpriseAnalyticsController {
  constructor(
    private readonly executiveDashboardService: ExecutiveDashboardService,
    private readonly firmAnalyticsService: FirmAnalyticsService,
    private readonly practiceGroupAnalyticsService: PracticeGroupAnalyticsService,
    private readonly attorneyPerformanceService: AttorneyPerformanceService,
    private readonly clientAnalyticsService: ClientAnalyticsService,
    private readonly financialReportsService: FinancialReportsService,
  ) {}

  @Get('executive/overview')
  @ApiOperation({ summary: 'Get executive dashboard overview' })
  @ApiResponse({ status: 200, description: 'Returns executive KPIs and charts' })
  async getExecutiveOverview(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.executiveDashboardService.getExecutiveOverview({
      organizationId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  @Get('executive/widgets/:userId')
  @ApiOperation({ summary: 'Get user dashboard widgets' })
  @ApiResponse({ status: 200, type: [DashboardWidget] })
  async getUserWidgets(
    @Param('userId') userId: string,
    @Query('dashboardId') dashboardId?: string,
  ) {
    return this.executiveDashboardService.getUserWidgets(userId, dashboardId);
  }

  @Post('executive/widgets')
  @ApiOperation({ summary: 'Create or update dashboard widget' })
  @ApiResponse({ status: 201, type: DashboardWidget })
  async saveWidget(
    @Query('userId') userId: string,
    @Body() widgetData: Partial<DashboardWidget>,
  ) {
    return this.executiveDashboardService.saveWidget(userId, widgetData);
  }

  @Delete('executive/widgets/:widgetId')
  @ApiOperation({ summary: 'Delete dashboard widget' })
  @ApiResponse({ status: 204, description: 'Widget deleted successfully' })
  async deleteWidget(
    @Param('widgetId') widgetId: string,
    @Query('userId') userId: string,
  ) {
    return this.executiveDashboardService.deleteWidget(widgetId, userId);
  }

  @Get('firm')
  @ApiOperation({ summary: 'Get comprehensive firm analytics' })
  @ApiResponse({ status: 200, description: 'Returns firm analytics data' })
  async getFirmAnalytics(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.firmAnalyticsService.getFirmAnalytics(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('firm/performance')
  @ApiOperation({ summary: 'Get firm performance time series' })
  @ApiResponse({ status: 200, description: 'Returns performance data over time' })
  async getFirmPerformance(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ) {
    return this.firmAnalyticsService.getFirmPerformanceTimeSeries(
      organizationId,
      new Date(startDate),
      new Date(endDate),
      granularity,
    );
  }

  @Get('firm/benchmarks')
  @ApiOperation({ summary: 'Get firm benchmarking data' })
  @ApiResponse({ status: 200, description: 'Returns benchmarking metrics' })
  async getFirmBenchmarks(@Query('organizationId') organizationId: string) {
    return this.firmAnalyticsService.getFirmBenchmarks(organizationId);
  }

  @Get('practice-groups')
  @ApiOperation({ summary: 'Get practice group metrics' })
  @ApiResponse({ status: 200, description: 'Returns practice group performance data' })
  async getPracticeGroupMetrics(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.practiceGroupAnalyticsService.getPracticeGroupMetrics(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('practice-groups/comparison')
  @ApiOperation({ summary: 'Get practice group comparison' })
  @ApiResponse({ status: 200, description: 'Returns comparative metrics across practice groups' })
  async getPracticeGroupComparison(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.practiceGroupAnalyticsService.getPracticeGroupComparison(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('attorneys/performance')
  @ApiOperation({ summary: 'Get attorney performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns attorney performance data' })
  async getAttorneyPerformance(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attorneyPerformanceService.getAttorneyPerformance(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('attorneys/:attorneyId/utilization')
  @ApiOperation({ summary: 'Get attorney utilization trend' })
  @ApiResponse({ status: 200, description: 'Returns utilization trend data' })
  async getAttorneyUtilizationTrend(
    @Param('attorneyId') attorneyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attorneyPerformanceService.getAttorneyUtilizationTrend(
      attorneyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('attorneys/leaderboard')
  @ApiOperation({ summary: 'Get attorney leaderboard' })
  @ApiResponse({ status: 200, description: 'Returns ranked attorney performance' })
  async getAttorneyLeaderboard(
    @Query('organizationId') organizationId: string,
    @Query('metric') metric: 'revenue' | 'utilization' | 'realization' = 'revenue',
    @Query('limit') limit = 10,
  ) {
    return this.attorneyPerformanceService.getAttorneyLeaderboard(
      organizationId,
      metric,
      limit,
    );
  }

  @Get('clients/profitability')
  @ApiOperation({ summary: 'Get client profitability metrics' })
  @ApiResponse({ status: 200, description: 'Returns client profitability data' })
  async getClientProfitability(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.clientAnalyticsService.getClientProfitability(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('clients/segmentation')
  @ApiOperation({ summary: 'Get client segmentation' })
  @ApiResponse({ status: 200, description: 'Returns client tier breakdown' })
  async getClientSegmentation(@Query('organizationId') organizationId: string) {
    return this.clientAnalyticsService.getClientSegmentation(organizationId);
  }

  @Get('clients/retention')
  @ApiOperation({ summary: 'Get client retention analysis' })
  @ApiResponse({ status: 200, description: 'Returns retention metrics and trends' })
  async getClientRetention(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.clientAnalyticsService.getClientRetentionAnalysis(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('clients/:clientId/lifetime-value')
  @ApiOperation({ summary: 'Get client lifetime value' })
  @ApiResponse({ status: 200, description: 'Returns LTV metrics for client' })
  async getClientLifetimeValue(@Param('clientId') clientId: string) {
    return this.clientAnalyticsService.getClientLifetimeValue(clientId);
  }

  @Get('financial/summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiResponse({ status: 200, description: 'Returns comprehensive financial overview' })
  async getFinancialSummary(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financialReportsService.getFinancialSummary(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('financial/cash-flow')
  @ApiOperation({ summary: 'Get cash flow analysis' })
  @ApiResponse({ status: 200, description: 'Returns cash flow data' })
  async getCashFlowAnalysis(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financialReportsService.getCashFlowAnalysis(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('financial/revenue-breakdown')
  @ApiOperation({ summary: 'Get revenue breakdown' })
  @ApiResponse({ status: 200, description: 'Returns revenue by various dimensions' })
  async getRevenueBreakdown(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financialReportsService.getRevenueBreakdown(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
