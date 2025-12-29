import { Controller, Get, Query, Param} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
 }from '@nestjs/swagger';
import { CaseAnalyticsService } from './case-analytics.service';
import {
  CaseMetricsQueryDto,
  AnalyticsCaseMetricsDto,
  CaseTrendDataPoint,
  CaseSpecificMetricsDto,
  PracticeAreaBreakdownDto,
} from './dto/case-analytics.dto';

@ApiTags('Analytics - Cases')

@Controller('analytics')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is available
@ApiBearerAuth()
export class CaseAnalyticsController {
  constructor(private readonly caseAnalyticsService: CaseAnalyticsService) {}

  @Get('case-metrics')
  @ApiOperation({ summary: 'Get overall case metrics and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Case metrics retrieved successfully',
    type: AnalyticsCaseMetricsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCaseMetrics(@Query() query: CaseMetricsQueryDto): Promise<AnalyticsCaseMetricsDto> {
    return this.caseAnalyticsService.getCaseMetrics(query);
  }

  @Get('case-metrics/:caseId')
  @ApiOperation({ summary: 'Get metrics for a specific case' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case-specific metrics retrieved successfully',
    type: CaseSpecificMetricsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCaseSpecificMetrics(
    @Param('caseId') caseId: string,
  ): Promise<CaseSpecificMetricsDto> {
    return this.caseAnalyticsService.getCaseSpecificMetrics(caseId);
  }

  @Get('case-trends')
  @ApiOperation({ summary: 'Get case trends over time' })
  @ApiResponse({
    status: 200,
    description: 'Case trends retrieved successfully',
    type: [CaseTrendDataPoint],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCaseTrends(
    @Query() query: CaseMetricsQueryDto,
  ): Promise<CaseTrendDataPoint[]> {
    return this.caseAnalyticsService.getCaseTrends(query);
  }

  @Get('practice-area-breakdown')
  @ApiOperation({ summary: 'Get metrics breakdown by practice area' })
  @ApiResponse({
    status: 200,
    description: 'Practice area breakdown retrieved successfully',
    type: [PracticeAreaBreakdownDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPracticeAreaBreakdown(
    @Query() query: CaseMetricsQueryDto,
  ): Promise<PracticeAreaBreakdownDto[]> {
    return this.caseAnalyticsService.getPracticeAreaBreakdown(query);
  }
}

