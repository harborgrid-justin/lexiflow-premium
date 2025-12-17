import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MonitoringService } from './monitoring.service';
import { AlertSeverity } from './entities/system-alert.entity';

@ApiTags('Monitoring')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public()
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health' })
  async getSystemHealth() {
    return await this.monitoringService.getSystemHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get performance metrics' })
  async getMetrics(@Query() query: any) {
    return await this.monitoringService.getMetrics(query);
  }

  @Post('metrics')
  @ApiOperation({ summary: 'Record performance metric' })
  async recordMetric(@Body() body: any) {
    return await this.monitoringService.recordMetric(body);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get system alerts' })
  async getAlerts(
    @Query('severity') severity?: AlertSeverity,
    @Query('resolved') resolved?: string,
    @Query() pagination?: any,
  ) {
    return await this.monitoringService.getAlerts({
      severity,
      resolved: resolved === 'true',
      ...pagination,
    });
  }

  @Post('alerts')
  @ApiOperation({ summary: 'Create system alert' })
  async createAlert(@Body() body: any) {
    return await this.monitoringService.createAlert(body);
  }

  @Post('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge alert' })
  async acknowledgeAlert(@Param('id') id: string, @Body() body: { userId: string }) {
    return await this.monitoringService.acknowledgeAlert(id, body.userId);
  }

  @Post('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve alert' })
  async resolveAlert(@Param('id') id: string) {
    return await this.monitoringService.resolveAlert(id);
  }
}
