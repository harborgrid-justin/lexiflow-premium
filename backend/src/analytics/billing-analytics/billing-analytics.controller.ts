import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Analytics - Billing')
@Public() // Allow public access for development
@Controller('analytics/billing')
@UseGuards(JwtAuthGuard)
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRealizationAnalysis(
    @Query() query: BillingAnalyticsQueryDto,
  ): Promise<RealizationAnalysisDto> {
    return this.billingAnalyticsService.getRealizationAnalysis(query);
  }
}

