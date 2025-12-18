import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Track an analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully', type: AnalyticsEvent })
  async trackEvent(@Body() eventData: any): Promise<AnalyticsEvent> {
    return this.analyticsService.trackEvent(eventData);
  }

  @Get('events/type/:eventType')
  @ApiOperation({ summary: 'Get events by type' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  async getEventsByType(@Param('eventType') eventType: string): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByType(eventType);
  }

  @Get('events/entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get events by entity' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  async getEventsByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByEntity(entityType, entityId);
  }

  @Get('events/user/:userId')
  @ApiOperation({ summary: 'Get events by user' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  async getEventsByUser(@Param('userId') userId: string): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByUser(userId);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get events by date range' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [AnalyticsEvent] })
  async getEventsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByDateRange(new Date(startDate), new Date(endDate));
  }

  @Get('metrics/case')
  @ApiOperation({ summary: 'Get case metrics' })
  @ApiResponse({ status: 200, description: 'Case metrics retrieved successfully' })
  async getCaseMetrics(): Promise<any> {
    return this.analyticsService.getCaseMetrics();
  }

  @Get('metrics/user-activity')
  @ApiOperation({ summary: 'Get user activity metrics' })
  @ApiResponse({ status: 200, description: 'User activity metrics retrieved successfully' })
  async getUserActivityMetrics(): Promise<any> {
    return this.analyticsService.getUserActivityMetrics();
  }

  @Get('metrics/billing')
  @ApiOperation({ summary: 'Get billing metrics' })
  @ApiResponse({ status: 200, description: 'Billing metrics retrieved successfully' })
  async getBillingMetrics(): Promise<any> {
    return this.analyticsService.getBillingMetrics();
  }

  @Get('dashboards')
  @ApiOperation({ summary: 'Get all dashboards' })
  @ApiResponse({ status: 200, description: 'Dashboards retrieved successfully', type: [Dashboard] })
  async getDashboards(@Query('userId') userId: string): Promise<Dashboard[]> {
    return this.analyticsService.getAllDashboards(userId);
  }

  @Get('dashboards/public')
  @ApiOperation({ summary: 'Get public dashboards' })
  @ApiResponse({ status: 200, description: 'Public dashboards retrieved successfully', type: [Dashboard] })
  async getPublicDashboards(): Promise<Dashboard[]> {
    return this.analyticsService.getPublicDashboards();
  }

  @Get('dashboards/:id')
  @ApiOperation({ summary: 'Get dashboard by ID' })
  @ApiResponse({ status: 200, description: 'Dashboard retrieved successfully', type: Dashboard })
  async getDashboard(@Param('id') id: string): Promise<Dashboard> {
    return this.analyticsService.getDashboardById(id);
  }

  @Post('dashboards')
  @ApiOperation({ summary: 'Create a new dashboard' })
  @ApiResponse({ status: 201, description: 'Dashboard created successfully', type: Dashboard })
  async createDashboard(@Body() dashboardData: any): Promise<Dashboard> {
    return this.analyticsService.createDashboard(dashboardData);
  }

  @Get('timeseries/:eventType')
  @ApiOperation({ summary: 'Get time series data for event type' })
  @ApiResponse({ status: 200, description: 'Time series data retrieved successfully' })
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
  async generateReport(@Body() params: any): Promise<any> {
    return this.analyticsService.generateReport(params);
  }
}
