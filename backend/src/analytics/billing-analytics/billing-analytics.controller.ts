import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BillingAnalyticsService } from './billing-analytics.service';
import {
  BillingAnalyticsQueryDto,
  BillingMetricsDto,
  BillingTrendDataPoint,
  WipAgingDto,
  ArAgingDto,
  RealizationAnalysisDto,
} from './dto/billing-analytics.dto';

@ApiTags('Analytics - Billing')
@Controller('api/v1/analytics/billing')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is available
@ApiBearerAuth()
export class BillingAnalyticsController {
  constructor(
    private readonly billingAnalyticsService: BillingAnalyticsService,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get overall billing metrics' })
  @ApiResponse({
    status: 200,
    description: 'Billing metrics retrieved successfully',
    type: BillingMetricsDto,
  })
  async getBillingMetrics(
    @Query() query: BillingAnalyticsQueryDto,
  ): Promise<BillingMetricsDto> {
    return this.billingAnalyticsService.getBillingMetrics(query);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get billing trends over time' })
  @ApiResponse({
    status: 200,
    description: 'Billing trends retrieved successfully',
    type: [BillingTrendDataPoint],
  })
  async getBillingTrends(
    @Query() query: BillingAnalyticsQueryDto,
  ): Promise<BillingTrendDataPoint[]> {
    return this.billingAnalyticsService.getBillingTrends(query);
  }

  @Get('wip-aging')
  @ApiOperation({ summary: 'Get work in progress (WIP) aging report' })
  @ApiResponse({
    status: 200,
    description: 'WIP aging data retrieved successfully',
    type: WipAgingDto,
  })
  async getWipAging(
    @Query() query: BillingAnalyticsQueryDto,
  ): Promise<WipAgingDto> {
    return this.billingAnalyticsService.getWipAging(query);
  }

  @Get('ar-aging')
  @ApiOperation({ summary: 'Get accounts receivable (AR) aging report' })
  @ApiResponse({
    status: 200,
    description: 'AR aging data retrieved successfully',
    type: ArAgingDto,
  })
  async getArAging(
    @Query() query: BillingAnalyticsQueryDto,
  ): Promise<ArAgingDto> {
    return this.billingAnalyticsService.getArAging(query);
  }

  @Get('realization')
  @ApiOperation({ summary: 'Get realization rate analysis' })
  @ApiResponse({
    status: 200,
    description: 'Realization analysis retrieved successfully',
    type: RealizationAnalysisDto,
  })
  async getRealizationAnalysis(
    @Query() query: BillingAnalyticsQueryDto,
  ): Promise<RealizationAnalysisDto> {
    return this.billingAnalyticsService.getRealizationAnalysis(query);
  }
}
