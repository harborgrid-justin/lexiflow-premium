import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse }from '@nestjs/swagger';
import { BillingAnalyticsService } from './billing-analytics.service';
import {
  AnalyticsFilterDto,
  WipStatsResponse,
  RealizationResponse,
  OperatingSummaryResponse,
  ArAgingResponse,
} from './dto/analytics-filter.dto';


@Controller('billing')
export class BillingAnalyticsController {
  constructor(private readonly billingAnalyticsService: BillingAnalyticsService) {}

  @Get('wip-stats')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getWipStats(@Query() filterDto: AnalyticsFilterDto): Promise<WipStatsResponse> {
    return await this.billingAnalyticsService.getWipStats(filterDto);
  }

  @Get('realization')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRealizationRates(@Query() filterDto: AnalyticsFilterDto): Promise<RealizationResponse> {
    return await this.billingAnalyticsService.getRealizationRates(filterDto);
  }

  @Get('operating-summary')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOperatingSummary(
    @Query() filterDto: AnalyticsFilterDto,
  ): Promise<OperatingSummaryResponse> {
    return await this.billingAnalyticsService.getOperatingSummary(filterDto);
  }

  @Get('ar-aging')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getArAging(@Query() filterDto: AnalyticsFilterDto): Promise<ArAgingResponse> {
    return await this.billingAnalyticsService.getArAging(filterDto);
  }
}

