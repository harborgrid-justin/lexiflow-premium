import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsDashboardService } from './analytics-dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@ApiTags('Analytics Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/analytics/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsDashboardController {
  constructor(private readonly analyticsDashboardService: AnalyticsDashboardService) {}

  @Get('kpis')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get key performance indicators' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 30d, 90d, 1y)' })
  async getKPIs(@Query() query: any) {
    return this.analyticsDashboardService.getKPIs(query);
  }

  @Get('cases/metrics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get case metrics' })
  @ApiResponse({ status: 200, description: 'Case metrics retrieved successfully' })
  async getCaseMetrics(@Query() query: any) {
    return this.analyticsDashboardService.getCaseMetrics(query);
  }

  @Get('financial')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get financial metrics' })
  @ApiResponse({ status: 200, description: 'Financial metrics retrieved successfully' })
  async getFinancialMetrics(@Query() query: any) {
    return this.analyticsDashboardService.getFinancialMetrics(query);
  }

  @Get('team/performance')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get team performance metrics' })
  @ApiResponse({ status: 200, description: 'Team performance retrieved successfully' })
  async getTeamPerformance(@Query() query: any) {
    return this.analyticsDashboardService.getTeamPerformance(query);
  }

  @Get('clients/metrics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get client metrics' })
  @ApiResponse({ status: 200, description: 'Client metrics retrieved successfully' })
  async getClientMetrics(@Query() query: any) {
    return this.analyticsDashboardService.getClientMetrics(query);
  }

  @Get('charts/:type')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Get chart data' })
  @ApiResponse({ status: 200, description: 'Chart data retrieved successfully' })
  async getChartData(@Param('type') type: string, @Query() query: any) {
    return this.analyticsDashboardService.getChartData(type, query);
  }
}
