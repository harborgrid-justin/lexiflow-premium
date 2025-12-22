import { Controller, Get, Post, Body, Param, Query, Head, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MonitoringService } from './monitoring.service';
import { GetMetricsQueryDto, RecordMetricDto, GetAlertsQueryDto, CreateAlertDto, AcknowledgeAlertDto } from './dto/monitoring.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Monitoring')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @Head('health')
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'monitoring' };
  }

  @Get('system-health')
  @ApiOperation({ summary: 'Get system health' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSystemHealth() {
    return await this.monitoringService.getSystemHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getMetrics(@Query() query: GetMetricsQueryDto) {
    return await this.monitoringService.getMetrics(query);
  }

  @Post('metrics')
  @ApiOperation({ summary: 'Record performance metric' })
  @ApiResponse({ status: 201, description: 'Metric recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async recordMetric(@Body() dto: RecordMetricDto) {
    return await this.monitoringService.recordMetric(dto);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get system alerts' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAlerts(@Query() query: GetAlertsQueryDto) {
    return await this.monitoringService.getAlerts(query);
  }

  @Post('alerts')
  @ApiOperation({ summary: 'Create system alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createAlert(@Body() dto: CreateAlertDto) {
    return await this.monitoringService.createAlert(dto);
  }

  @Post('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async acknowledgeAlert(@Param('id') id: string, @Body() dto: AcknowledgeAlertDto) {
    return await this.monitoringService.acknowledgeAlert(id, dto.userId);
  }

  @Post('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve alert' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async resolveAlert(@Param('id') id: string) {
    return await this.monitoringService.resolveAlert(id);
  }
}
