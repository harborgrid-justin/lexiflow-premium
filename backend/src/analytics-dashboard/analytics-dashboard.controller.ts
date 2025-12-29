import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AnalyticsDashboardService } from './analytics-dashboard.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@users/entities/user.entity';
import { GetKPIsDto } from './dto/get-kpis.dto';
import { GetCaseMetricsDto } from './dto/get-case-metrics.dto';
import { GetFinancialMetricsDto } from './dto/get-financial-metrics.dto';
import { GetTeamPerformanceDto } from './dto/get-team-performance.dto';
import { GetClientMetricsDto } from './dto/get-client-metrics.dto';
import { GetChartDataDto } from './dto/get-chart-data.dto';
import { GetStatsDto } from './dto/get-stats.dto';
import {
  KPIsResponseDto,
  CaseMetricsResponseDto,
  FinancialMetricsResponseDto,
  TeamPerformanceResponseDto,
  ClientMetricsResponseDto,
  ChartDataResponseDto,
  DashboardStatsResponseDto,
} from './dto/dashboard-response.dto';
import {
  BulkExportAnalyticsDto,
  BulkExportResponseDto,
  BulkRefreshDashboardsDto,
  BulkRefreshResponseDto,
  BulkDeleteEventsDto,
  BulkDeleteResponseDto,
} from './dto/bulk-operations.dto';
import {
  GetRealtimeMetricsDto,
  RealtimeMetricsResponseDto,
  ActiveUsersRealtimeDto,
  SystemPerformanceRealtimeDto,
  CaseActivityRealtimeDto,
  RevenueRealtimeDto,
  AlertsResponseDto,
} from './dto/realtime-metrics.dto';

@ApiTags('Analytics Dashboard')
@ApiBearerAuth('JWT-auth')

@Controller('analytics/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsDashboardController {
  constructor(private readonly analyticsDashboardService: AnalyticsDashboardService) {}

  @Get('kpis')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get key performance indicators' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully', type: KPIsResponseDto })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 30d, 90d, 1y)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKPIs(@Query() query: GetKPIsDto): Promise<KPIsResponseDto> {
    return this.analyticsDashboardService.getKPIs(query);
  }

  @Get('cases/metrics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get case metrics' })
  @ApiResponse({ status: 200, description: 'Case metrics retrieved successfully', type: CaseMetricsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCaseMetrics(@Query() query: GetCaseMetricsDto): Promise<CaseMetricsResponseDto> {
    return this.analyticsDashboardService.getCaseMetrics(query);
  }

  @Get('financial')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get financial metrics' })
  @ApiResponse({ status: 200, description: 'Financial metrics retrieved successfully', type: FinancialMetricsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getFinancialMetrics(@Query() query: GetFinancialMetricsDto): Promise<FinancialMetricsResponseDto> {
    return this.analyticsDashboardService.getFinancialMetrics(query);
  }

  @Get('team/performance')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get team performance metrics' })
  @ApiResponse({ status: 200, description: 'Team performance retrieved successfully', type: TeamPerformanceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTeamPerformance(@Query() query: GetTeamPerformanceDto): Promise<TeamPerformanceResponseDto> {
    return this.analyticsDashboardService.getTeamPerformance(query);
  }

  @Get('clients/metrics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get client metrics' })
  @ApiResponse({ status: 200, description: 'Client metrics retrieved successfully', type: ClientMetricsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getClientMetrics(@Query() query: GetClientMetricsDto): Promise<ClientMetricsResponseDto> {
    return this.analyticsDashboardService.getClientMetrics(query);
  }

  @Get('charts/:type')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get chart data' })
  @ApiResponse({ status: 200, description: 'Chart data retrieved successfully', type: ChartDataResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getChartData(@Param('type') type: string, @Query() query: GetChartDataDto): Promise<ChartDataResponseDto> {
    return this.analyticsDashboardService.getChartData(type, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: DashboardStatsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats(@Query() query: GetStatsDto): Promise<DashboardStatsResponseDto> {
    return this.analyticsDashboardService.getStats(query);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get recent alerts' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully', type: AlertsResponseDto })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of alerts to return' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRecentAlerts(@Query('limit') limit?: number): Promise<AlertsResponseDto> {
    return this.analyticsDashboardService.getRecentAlerts(limit);
  }

  // ============================================
  // REAL-TIME METRICS ENDPOINTS
  // ============================================

  @Get('realtime/metrics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get real-time metrics snapshot' })
  @ApiResponse({ status: 200, description: 'Real-time metrics retrieved successfully', type: RealtimeMetricsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRealtimeMetrics(@Query() query: GetRealtimeMetricsDto): Promise<RealtimeMetricsResponseDto> {
    return this.analyticsDashboardService.getRealtimeMetrics(query);
  }

  @Get('realtime/active-users')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get real-time active users metrics' })
  @ApiResponse({ status: 200, description: 'Active users metrics retrieved successfully', type: ActiveUsersRealtimeDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getActiveUsersRealtime(): Promise<ActiveUsersRealtimeDto> {
    return this.analyticsDashboardService.getActiveUsersRealtime();
  }

  @Get('realtime/system-performance')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get real-time system performance metrics' })
  @ApiResponse({ status: 200, description: 'System performance metrics retrieved successfully', type: SystemPerformanceRealtimeDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSystemPerformanceRealtime(): Promise<SystemPerformanceRealtimeDto> {
    return this.analyticsDashboardService.getSystemPerformanceRealtime();
  }

  @Get('realtime/case-activity')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get real-time case activity metrics' })
  @ApiResponse({ status: 200, description: 'Case activity metrics retrieved successfully', type: CaseActivityRealtimeDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCaseActivityRealtime(): Promise<CaseActivityRealtimeDto> {
    return this.analyticsDashboardService.getCaseActivityRealtime();
  }

  @Get('realtime/revenue')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get real-time revenue metrics' })
  @ApiResponse({ status: 200, description: 'Revenue metrics retrieved successfully', type: RevenueRealtimeDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRevenueRealtime(): Promise<RevenueRealtimeDto> {
    return this.analyticsDashboardService.getRevenueRealtime();
  }

  // ============================================
  // BULK OPERATIONS ENDPOINTS
  // ============================================

  @Post('export')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Export analytics data in various formats' })
  @ApiResponse({ status: 202, description: 'Export job initiated successfully', type: BulkExportResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportAnalyticsData(@Body() exportDto: BulkExportAnalyticsDto): Promise<BulkExportResponseDto> {
    return this.analyticsDashboardService.exportAnalyticsData(exportDto);
  }

  @Get('export/:jobId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get export job status' })
  @ApiResponse({ status: 200, description: 'Export job status retrieved successfully', type: BulkExportResponseDto })
  @ApiResponse({ status: 404, description: 'Export job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getExportJobStatus(@Param('jobId') jobId: string): Promise<BulkExportResponseDto> {
    return this.analyticsDashboardService.getExportJobStatus(jobId);
  }

  @Post('bulk/refresh')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Bulk refresh dashboards' })
  @ApiResponse({ status: 200, description: 'Dashboards refreshed successfully', type: BulkRefreshResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkRefreshDashboards(@Body() refreshDto: BulkRefreshDashboardsDto): Promise<BulkRefreshResponseDto> {
    return this.analyticsDashboardService.bulkRefreshDashboards(refreshDto);
  }

  @Delete('bulk/events')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk delete analytics events' })
  @ApiResponse({ status: 200, description: 'Events deleted successfully', type: BulkDeleteResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkDeleteEvents(@Body() deleteDto: BulkDeleteEventsDto): Promise<BulkDeleteResponseDto> {
    return this.analyticsDashboardService.bulkDeleteEvents(deleteDto);
  }
}

