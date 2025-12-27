import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { MetricsCollectorService } from '../services/metrics.collector.service';
import { HealthAggregatorService } from '../services/health.aggregator.service';
import { AlertingService } from '../services/alerting.service';

/**
 * Metrics Controller
 * Provides monitoring endpoints for metrics, health checks, and observability
 * Prometheus-compatible metrics endpoint
 */
@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsCollector: MetricsCollectorService,
    private readonly healthAggregator: HealthAggregatorService,
    private readonly alertingService: AlertingService,
  ) {}

  /**
   * Prometheus-compatible metrics endpoint
   * Returns metrics in Prometheus exposition format
   */
  @Public()
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiOperation({
    summary: 'Get Prometheus metrics',
    description: 'Returns application metrics in Prometheus exposition format',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: `# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/v1/users",status="200"} 1234
# TYPE http_request_duration_ms histogram
http_request_duration_ms_count{method="GET",path="/api/v1/users"} 1234
http_request_duration_ms_sum{method="GET",path="/api/v1/users"} 45678`,
        },
      },
    },
  })
  getPrometheusMetrics(): string {
    return this.metricsCollector.exportPrometheusMetrics();
  }

  /**
   * Get metrics in JSON format
   */
  @Public()
  @Get('json')
  @ApiOperation({
    summary: 'Get metrics in JSON format',
    description: 'Returns application metrics as JSON for easy consumption',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
  })
  getMetricsJson() {
    return {
      snapshot: this.metricsCollector.getMetricsSnapshot(),
      requests: this.metricsCollector.getRequestStats(),
      database: this.metricsCollector.getDatabaseStats(),
      cache: this.metricsCollector.getCacheStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Detailed health check endpoint
   * Returns comprehensive health information
   */
  @Public()
  @Get('health/detailed')
  @ApiOperation({
    summary: 'Detailed health check',
    description: 'Returns detailed health status of all system components',
  })
  @ApiResponse({
    status: 200,
    description: 'Health information retrieved successfully',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  async getDetailedHealth() {
    return await this.healthAggregator.getHealth();
  }

  /**
   * Readiness probe for Kubernetes
   * Returns 200 when service is ready to accept traffic
   */
  @Public()
  @Get('health/ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Kubernetes readiness probe - indicates if service can accept traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
  })
  async getReadiness() {
    const readiness = await this.healthAggregator.getReadiness();

    if (!readiness.ready) {
      throw new Error('Service not ready');
    }

    return {
      status: 'ready',
      ...readiness,
    };
  }

  /**
   * Liveness probe for Kubernetes
   * Returns 200 when service is alive (process is running)
   */
  @Public()
  @Get('health/live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Kubernetes liveness probe - indicates if service is alive',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  getLiveness() {
    return this.healthAggregator.getLiveness();
  }

  /**
   * Get request statistics
   */
  @Public()
  @Get('stats/requests')
  @ApiOperation({
    summary: 'Get request statistics',
    description: 'Returns detailed statistics about HTTP requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Request statistics retrieved successfully',
  })
  getRequestStats() {
    return {
      requests: this.metricsCollector.getRequestStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get database statistics
   */
  @Public()
  @Get('stats/database')
  @ApiOperation({
    summary: 'Get database statistics',
    description: 'Returns detailed statistics about database queries',
  })
  @ApiResponse({
    status: 200,
    description: 'Database statistics retrieved successfully',
  })
  getDatabaseStats() {
    return {
      database: this.metricsCollector.getDatabaseStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get cache statistics
   */
  @Public()
  @Get('stats/cache')
  @ApiOperation({
    summary: 'Get cache statistics',
    description: 'Returns detailed statistics about cache performance',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
  })
  getCacheStats() {
    return {
      cache: this.metricsCollector.getCacheStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get alert statistics
   */
  @Public()
  @Get('stats/alerts')
  @ApiOperation({
    summary: 'Get alert statistics',
    description: 'Returns statistics about system alerts',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert statistics retrieved successfully',
  })
  async getAlertStats() {
    return {
      alerts: await this.alertingService.getAlertStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get active alerts
   */
  @Public()
  @Get('alerts/active')
  @ApiOperation({
    summary: 'Get active alerts',
    description: 'Returns all currently active (unresolved) alerts',
  })
  @ApiResponse({
    status: 200,
    description: 'Active alerts retrieved successfully',
  })
  async getActiveAlerts() {
    return {
      alerts: await this.alertingService.getActiveAlerts(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get alert rules
   */
  @Public()
  @Get('alerts/rules')
  @ApiOperation({
    summary: 'Get alert rules',
    description: 'Returns all configured alert rules',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert rules retrieved successfully',
  })
  getAlertRules() {
    return {
      rules: this.alertingService.getRules(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * System information endpoint
   */
  @Public()
  @Get('system')
  @ApiOperation({
    summary: 'Get system information',
    description: 'Returns general system information',
  })
  @ApiResponse({
    status: 200,
    description: 'System information retrieved successfully',
  })
  getSystemInfo() {
    return {
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        pid: process.pid,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
