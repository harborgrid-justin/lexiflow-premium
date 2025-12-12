import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DiscoveryAnalyticsService } from './discovery-analytics.service';
import {
  DiscoveryAnalyticsQueryDto,
  DiscoveryFunnelDto,
  DiscoveryTimelineDto,
  CaseDiscoveryMetricsDto,
  DiscoveryProductionVolumeDto,
} from './dto/discovery-analytics.dto';

@ApiTags('Analytics - Discovery')
@Controller('api/v1/analytics')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is available
@ApiBearerAuth()
export class DiscoveryAnalyticsController {
  constructor(
    private readonly discoveryAnalyticsService: DiscoveryAnalyticsService,
  ) {}

  @Get('discovery-funnel')
  @ApiOperation({ summary: 'Get discovery funnel analytics' })
  @ApiResponse({
    status: 200,
    description: 'Discovery funnel data retrieved successfully',
    type: DiscoveryFunnelDto,
  })
  async getDiscoveryFunnel(
    @Query() query: DiscoveryAnalyticsQueryDto,
  ): Promise<DiscoveryFunnelDto> {
    return this.discoveryAnalyticsService.getDiscoveryFunnel(query);
  }

  @Get('discovery-funnel/:caseId')
  @ApiOperation({ summary: 'Get case-specific discovery funnel' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case discovery funnel retrieved successfully',
    type: DiscoveryFunnelDto,
  })
  async getCaseDiscoveryFunnel(
    @Param('caseId') caseId: string,
  ): Promise<DiscoveryFunnelDto> {
    return this.discoveryAnalyticsService.getCaseDiscoveryFunnel(caseId);
  }

  @Get('discovery-timeline')
  @ApiOperation({ summary: 'Get discovery timeline and milestones' })
  @ApiResponse({
    status: 200,
    description: 'Discovery timeline retrieved successfully',
    type: DiscoveryTimelineDto,
  })
  async getDiscoveryTimeline(
    @Query() query: DiscoveryAnalyticsQueryDto,
  ): Promise<DiscoveryTimelineDto> {
    return this.discoveryAnalyticsService.getDiscoveryTimeline(query);
  }

  @Get('discovery-metrics/:caseId')
  @ApiOperation({ summary: 'Get case-specific discovery metrics' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case discovery metrics retrieved successfully',
    type: CaseDiscoveryMetricsDto,
  })
  async getCaseDiscoveryMetrics(
    @Param('caseId') caseId: string,
  ): Promise<CaseDiscoveryMetricsDto> {
    return this.discoveryAnalyticsService.getCaseDiscoveryMetrics(caseId);
  }

  @Get('production-volume')
  @ApiOperation({ summary: 'Get discovery production volume analytics' })
  @ApiResponse({
    status: 200,
    description: 'Production volume data retrieved successfully',
    type: DiscoveryProductionVolumeDto,
  })
  async getProductionVolume(
    @Query() query: DiscoveryAnalyticsQueryDto,
  ): Promise<DiscoveryProductionVolumeDto> {
    return this.discoveryAnalyticsService.getProductionVolume(query);
  }
}
