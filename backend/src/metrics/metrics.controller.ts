import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from '../common/services/metrics.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Metrics Controller
 * Exposes Prometheus-compatible metrics for monitoring
 * Public endpoint for Prometheus scraping
 */
@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Metrics in Prometheus format' })
  getMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }

  @Get('json')
  @Public()
  @ApiOperation({ summary: 'Get metrics as JSON' })
  @ApiResponse({ status: 200, description: 'Metrics in JSON format' })
  getMetricsJson() {
    return this.metricsService.getMetricsJson();
  }

  @Get('system')
  @Public()
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System resource metrics' })
  getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }
}
