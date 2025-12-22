import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AnalyticsDashboardService } from './analytics-dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { GetKPIsDto } from './dto/get-kpis.dto';
import { GetCaseMetricsDto } from './dto/get-case-metrics.dto';
import { GetFinancialMetricsDto } from './dto/get-financial-metrics.dto';
import { GetTeamPerformanceDto } from './dto/get-team-performance.dto';
import { GetClientMetricsDto } from './dto/get-client-metrics.dto';
import { GetChartDataDto } from './dto/get-chart-data.dto';
import { GetStatsDto } from './dto/get-stats.dto';

@ApiTags('Analytics Dashboard')
@ApiBearerAuth('JWT-auth')

@Controller('analytics/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsDashboardController {
  constructor(private readonly analyticsDashboardService: AnalyticsDashboardService) {}

  @Get('kpis')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get key performance indicators' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 30d, 90d, 1y)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKPIs(@Query() query: GetKPIsDto) {
    return this.analyticsDashboardService.getKPIs(query);
  }

  @Get('cases/metrics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get case metrics' })
  @ApiResponse({ status: 200, description: 'Case metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCaseMetrics(@Query() query: GetCaseMetricsDto) {
    return this.analyticsDashboardService.getCaseMetrics(query);
  }

  @Get('financial')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get financial metrics' })
  @ApiResponse({ status: 200, description: 'Financial metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getFinancialMetrics(@Query() query: GetFinancialMetricsDto) {
    return this.analyticsDashboardService.getFinancialMetrics(query);
  }

  @Get('team/performance')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get team performance metrics' })
  @ApiResponse({ status: 200, description: 'Team performance retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTeamPerformance(@Query() query: GetTeamPerformanceDto) {
    return this.analyticsDashboardService.getTeamPerformance(query);
  }

  @Get('clients/metrics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get client metrics' })
  @ApiResponse({ status: 200, description: 'Client metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getClientMetrics(@Query() query: GetClientMetricsDto) {
    return this.analyticsDashboardService.getClientMetrics(query);
  }

  @Get('charts/:type')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get chart data' })
  @ApiResponse({ status: 200, description: 'Chart data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getChartData(@Param('type') type: string, @Query() query: GetChartDataDto) {
    return this.analyticsDashboardService.getChartData(type, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats(@Query() query: GetStatsDto) {
    return this.analyticsDashboardService.getStats(query);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get recent alerts' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of alerts to return' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRecentAlerts(@Query('limit') limit?: number) {
    return this.analyticsDashboardService.getRecentAlerts(limit);
  }
}

