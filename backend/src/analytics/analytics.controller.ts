import { Controller, Get, Post, Body, Param, Query, Head, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Head('health')
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'analytics' };
  }

  @Post('events')
  @ApiOperation({ summary: 'Track an analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully', type: AnalyticsEvent })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async trackEvent(@Body() eventData: any): Promise<AnalyticsEvent> {
    return this.analyticsService.trackEvent(eventData);
  }

  @Get('events/type/:eventType')
  @ApiOperation({ summary: 'Get events by type' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEventsByType(@Param('eventType') eventType: string): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByType(eventType);
  }

  @Get('events/entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get events by entity' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEventsByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByEntity(entityType, entityId);
  }

  @Get('events/user/:userId')
  @ApiOperation({ summary: 'Get events by user' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEventsByUser(@Param('userId') userId: string): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByUser(userId);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get events by date range' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEventsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByDateRange(new Date(startDate), new Date(endDate));
  }

  @Get('metrics/case')
  @ApiOperation({ summary: 'Get case metrics' })
  @ApiResponse({ status: 200, description: 'Case metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCaseMetrics(): Promise<any> {
    return this.analyticsService.getCaseMetrics();
  }

  @Get('metrics/user-activity')
  @ApiOperation({ summary: 'Get user activity metrics' })
  @ApiResponse({ status: 200, description: 'User activity metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUserActivityMetrics(): Promise<any> {
    return this.analyticsService.getUserActivityMetrics();
  }

  @Get('metrics/billing')
  @ApiOperation({ summary: 'Get billing metrics' })
  @ApiResponse({ status: 200, description: 'Billing metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getBillingMetrics(): Promise<any> {
    return this.analyticsService.getBillingMetrics();
  }

  @Get('dashboards')
  @ApiOperation({ summary: 'Get all dashboards' })
  @ApiResponse({ status: 200, description: 'Dashboards retrieved successfully', type: [Dashboard] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDashboards(@Query('userId') userId: string): Promise<Dashboard[]> {
    return this.analyticsService.getAllDashboards(userId);
  }

  @Get('dashboards/public')
  @ApiOperation({ summary: 'Get public dashboards' })
  @ApiResponse({ status: 200, description: 'Public dashboards retrieved successfully', type: [Dashboard] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPublicDashboards(): Promise<Dashboard[]> {
    return this.analyticsService.getPublicDashboards();
  }

  @Get('dashboards/:id')
  @ApiOperation({ summary: 'Get dashboard by ID' })
  @ApiResponse({ status: 200, description: 'Dashboard retrieved successfully', type: Dashboard })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getDashboard(@Param('id') id: string): Promise<Dashboard> {
    return this.analyticsService.getDashboardById(id);
  }

  @Post('dashboards')
  @ApiOperation({ summary: 'Create a new dashboard' })
  @ApiResponse({ status: 201, description: 'Dashboard created successfully', type: Dashboard })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createDashboard(@Body() dashboardData: any): Promise<Dashboard> {
    return this.analyticsService.createDashboard(dashboardData);
  }

  @Get('timeseries/:eventType')
  @ApiOperation({ summary: 'Get time series data for event type' })
  @ApiResponse({ status: 200, description: 'Time series data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTimeSeriesData(
    @Param('eventType') eventType: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity?: string,
  ): Promise<any[]> {
    return this.analyticsService.getTimeSeriesData(
      eventType,
      granularity || 'day',
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Post('reports/generate')
  @ApiOperation({ summary: 'Generate analytics report' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async generateReport(@Body() params: any): Promise<any> {
    return this.analyticsService.generateReport(params);
  }
}
