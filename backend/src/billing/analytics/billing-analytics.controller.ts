import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { BillingAnalyticsService } from './billing-analytics.service';
import {
  AnalyticsFilterDto,
  WipStatsResponse,
  RealizationResponse,
  OperatingSummaryResponse,
  ArAgingResponse,
} from './dto/analytics-filter.dto';

@Public() // Allow public access for development
@Controller('billing')
export class BillingAnalyticsController {
  constructor(private readonly billingAnalyticsService: BillingAnalyticsService) {}

  @Get('wip-stats')
  async getWipStats(@Query() filterDto: AnalyticsFilterDto): Promise<WipStatsResponse> {
    return await this.billingAnalyticsService.getWipStats(filterDto);
  }

  @Get('realization')
  async getRealizationRates(@Query() filterDto: AnalyticsFilterDto): Promise<RealizationResponse> {
    return await this.billingAnalyticsService.getRealizationRates(filterDto);
  }

  @Get('operating-summary')
  async getOperatingSummary(
    @Query() filterDto: AnalyticsFilterDto,
  ): Promise<OperatingSummaryResponse> {
    return await this.billingAnalyticsService.getOperatingSummary(filterDto);
  }

  @Get('ar-aging')
  async getArAging(@Query() filterDto: AnalyticsFilterDto): Promise<ArAgingResponse> {
    return await this.billingAnalyticsService.getArAging(filterDto);
  }
}

