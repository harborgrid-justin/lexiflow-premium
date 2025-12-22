import { Controller, Get} from '@nestjs/common';
import { ApiTags, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

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
  
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Metrics in Prometheus format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }

  @Get('json')
  
  @ApiOperation({ summary: 'Get metrics as JSON' })
  @ApiResponse({ status: 200, description: 'Metrics in JSON format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getMetricsJson() {
    return this.metricsService.getMetricsJson();
  }

  @Get('system')
  
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System resource metrics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }
}
