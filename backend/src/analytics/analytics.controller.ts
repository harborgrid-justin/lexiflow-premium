import { Public } from "@common/decorators/public.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@users/entities/user.entity";
import { AnalyticsService } from "./analytics.service";
import {
  BulkArchiveAnalyticsEventsDto,
  BulkArchiveResponseDto,
  BulkDeleteAnalyticsEventsDto,
  BulkDeleteAnalyticsResponseDto,
  BulkImportEventsDto,
  BulkImportResponseDto,
  BulkRecalculateMetricsDto,
  BulkRecalculateResponseDto,
} from "./dto/bulk-analytics.dto";
import { CreateAnalyticsEventDto } from "./dto/create-analytics-event.dto";
import { CreateDashboardDto } from "./dto/create-dashboard.dto";
import {
  ExportAnalyticsDataDto,
  ExportAnalyticsResponseDto,
  ListExportJobsResponseDto,
} from "./dto/export-analytics.dto";
import {
  AnalyticsGenerateReportDto,
  GenerateReportResponseDto,
} from "./dto/generate-report.dto";
import {
  AnalyticsBillingMetricsDto,
  AnalyticsCaseMetricsDto,
  TimeSeriesDataPointDto,
  UserActivityMetricsDto,
} from "./dto/metrics-response.dto";
import { AnalyticsEvent } from "./entities/analytics-event.entity";
import { Dashboard } from "./entities/dashboard.entity";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Head("health")
  @Get("health")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  health() {
    return { status: "ok", service: "analytics" };
  }

  @Post("events")
  @ApiOperation({ summary: "Track an analytics event" })
  @ApiResponse({
    status: 201,
    description: "Event tracked successfully",
    type: AnalyticsEvent,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async trackEvent(
    @Body() eventData: CreateAnalyticsEventDto
  ): Promise<AnalyticsEvent> {
    return this.analyticsService.trackEvent(eventData);
  }

  @Get("events/type/:eventType")
  @ApiOperation({ summary: "Get events by type" })
  @ApiResponse({
    status: 200,
    description: "Events retrieved successfully",
    type: [AnalyticsEvent],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getEventsByType(
    @Param("eventType") eventType: string
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByType(eventType);
  }

  @Get("events/entity/:entityType/:entityId")
  @ApiOperation({ summary: "Get events by entity" })
  @ApiResponse({
    status: 200,
    description: "Events retrieved successfully",
    type: [AnalyticsEvent],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getEventsByEntity(
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByEntity(entityType, entityId);
  }

  @Get("events/user/:userId")
  @ApiOperation({ summary: "Get events by user" })
  @ApiResponse({
    status: 200,
    description: "Events retrieved successfully",
    type: [AnalyticsEvent],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getEventsByUser(
    @Param("userId") userId: string
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByUser(userId);
  }

  @Get("events")
  @ApiOperation({ summary: "Get events by date range" })
  @ApiResponse({
    status: 200,
    description: "Events retrieved successfully",
    type: [AnalyticsEvent],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getEventsByDateRange(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ): Promise<AnalyticsEvent[]> {
    return this.analyticsService.getEventsByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get("metrics/case")
  @ApiOperation({ summary: "Get case metrics" })
  @ApiResponse({
    status: 200,
    description: "Case metrics retrieved successfully",
    type: AnalyticsCaseMetricsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getCaseMetrics(): Promise<AnalyticsCaseMetricsDto> {
    return this.analyticsService.getCaseMetrics();
  }

  @Get("metrics/user-activity")
  @ApiOperation({ summary: "Get user activity metrics" })
  @ApiResponse({
    status: 200,
    description: "User activity metrics retrieved successfully",
    type: UserActivityMetricsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getUserActivityMetrics(): Promise<UserActivityMetricsDto> {
    return this.analyticsService.getUserActivityMetrics();
  }

  @Get("metrics/billing")
  @ApiOperation({ summary: "Get billing metrics" })
  @ApiResponse({
    status: 200,
    description: "Billing metrics retrieved successfully",
    type: AnalyticsBillingMetricsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getBillingMetrics(): Promise<AnalyticsBillingMetricsDto> {
    return this.analyticsService.getBillingMetrics();
  }

  @Get("dashboards")
  @ApiOperation({ summary: "Get all dashboards" })
  @ApiResponse({
    status: 200,
    description: "Dashboards retrieved successfully",
    type: [Dashboard],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getDashboards(@Query("userId") userId: string): Promise<Dashboard[]> {
    return this.analyticsService.getAllDashboards(userId);
  }

  @Get("dashboards/alerts")
  @ApiOperation({ summary: "Get dashboard alerts" })
  @ApiResponse({ status: 200, description: "Alerts retrieved successfully" })
  async getDashboardAlerts(): Promise<unknown[]> {
    // TODO: Implement real alerts logic
    return [];
  }

  @Get("dashboards/chart-data")
  @ApiOperation({ summary: "Get dashboard chart data" })
  @ApiResponse({
    status: 200,
    description: "Chart data retrieved successfully",
  })
  async getDashboardChartData(): Promise<unknown> {
    // TODO: Implement real chart data logic
    return {
      casesByStatus: [],
      revenueByMonth: [],
      taskCompletionRate: [],
    };
  }

  @Get("dashboards/public")
  @ApiOperation({ summary: "Get public dashboards" })
  @ApiResponse({
    status: 200,
    description: "Public dashboards retrieved successfully",
    type: [Dashboard],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getPublicDashboards(): Promise<Dashboard[]> {
    return this.analyticsService.getPublicDashboards();
  }

  @Get("dashboards/:id")
  @ApiOperation({ summary: "Get dashboard by ID" })
  @ApiResponse({
    status: 200,
    description: "Dashboard retrieved successfully",
    type: Dashboard,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async getDashboard(@Param("id") id: string): Promise<Dashboard> {
    return this.analyticsService.getDashboardById(id);
  }

  @Post("dashboards")
  @ApiOperation({ summary: "Create a new dashboard" })
  @ApiResponse({
    status: 201,
    description: "Dashboard created successfully",
    type: Dashboard,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async createDashboard(
    @Body() dashboardData: CreateDashboardDto
  ): Promise<Dashboard> {
    return this.analyticsService.createDashboard(dashboardData);
  }

  @Get("timeseries/:eventType")
  @ApiOperation({ summary: "Get time series data for event type" })
  @ApiResponse({
    status: 200,
    description: "Time series data retrieved successfully",
    type: [TimeSeriesDataPointDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getTimeSeriesData(
    @Param("eventType") eventType: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("granularity") granularity?: string
  ): Promise<TimeSeriesDataPointDto[]> {
    return this.analyticsService.getTimeSeriesData(
      eventType,
      granularity || "day",
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post("reports/generate")
  @ApiOperation({ summary: "Generate analytics report" })
  @ApiResponse({
    status: 200,
    description: "Report generated successfully",
    type: GenerateReportResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async generateReport(
    @Body() params: AnalyticsGenerateReportDto
  ): Promise<GenerateReportResponseDto> {
    return this.analyticsService.generateReport(params);
  }

  // ============================================
  // BULK OPERATIONS ENDPOINTS
  // ============================================

  @Post("bulk/import-events")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Bulk import analytics events" })
  @ApiResponse({
    status: 202,
    description: "Import job initiated successfully",
    type: BulkImportResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async bulkImportEvents(
    @Body() importDto: BulkImportEventsDto
  ): Promise<BulkImportResponseDto> {
    return this.analyticsService.bulkImportEvents(importDto);
  }

  @Post("bulk/recalculate-metrics")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Bulk recalculate analytics metrics" })
  @ApiResponse({
    status: 202,
    description: "Recalculation job initiated successfully",
    type: BulkRecalculateResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async bulkRecalculateMetrics(
    @Body() recalculateDto: BulkRecalculateMetricsDto
  ): Promise<BulkRecalculateResponseDto> {
    return this.analyticsService.bulkRecalculateMetrics(recalculateDto);
  }

  @Post("bulk/archive-events")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Bulk archive analytics events" })
  @ApiResponse({
    status: 200,
    description: "Events archived successfully",
    type: BulkArchiveResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async bulkArchiveEvents(
    @Body() archiveDto: BulkArchiveAnalyticsEventsDto
  ): Promise<BulkArchiveResponseDto> {
    return this.analyticsService.bulkArchiveEvents(archiveDto);
  }

  @Delete("bulk/delete-events")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Bulk delete analytics events" })
  @ApiResponse({
    status: 200,
    description: "Events deleted successfully",
    type: BulkDeleteAnalyticsResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async bulkDeleteEvents(
    @Body() deleteDto: BulkDeleteAnalyticsEventsDto
  ): Promise<BulkDeleteAnalyticsResponseDto> {
    return this.analyticsService.bulkDeleteEvents(deleteDto);
  }

  // ============================================
  // EXPORT ENDPOINTS
  // ============================================

  @Post("export")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Export analytics data in various formats" })
  @ApiResponse({
    status: 202,
    description: "Export job initiated successfully",
    type: ExportAnalyticsResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async exportAnalyticsData(
    @Body() exportDto: ExportAnalyticsDataDto
  ): Promise<ExportAnalyticsResponseDto> {
    return this.analyticsService.exportAnalyticsData(
      exportDto
    ) as unknown as ExportAnalyticsResponseDto;
  }

  @Get("export/jobs")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: "List all export jobs" })
  @ApiResponse({
    status: 200,
    description: "Export jobs retrieved successfully",
    type: ListExportJobsResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async listExportJobs(
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<ListExportJobsResponseDto> {
    return this.analyticsService.listExportJobs(
      page,
      limit
    ) as unknown as ListExportJobsResponseDto;
  }

  @Get("export/:jobId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: "Get export job status" })
  @ApiResponse({
    status: 200,
    description: "Export job status retrieved successfully",
    type: ExportAnalyticsResponseDto,
  })
  @ApiResponse({ status: 404, description: "Export job not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getExportJobStatus(
    @Param("jobId") jobId: string
  ): Promise<ExportAnalyticsResponseDto> {
    return this.analyticsService.getExportJobStatus(
      jobId
    ) as unknown as ExportAnalyticsResponseDto;
  }

  @Delete("export/:jobId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Cancel or delete export job" })
  @ApiResponse({
    status: 200,
    description: "Export job cancelled successfully",
  })
  @ApiResponse({ status: 404, description: "Export job not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async cancelExportJob(
    @Param("jobId") jobId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.analyticsService.cancelExportJob(jobId);
  }
}
