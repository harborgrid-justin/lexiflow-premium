import { Public } from "@common/decorators/public.decorator";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { BillingAnalyticsService } from "./billing-analytics.service";
import {
  AnalyticsFilterDto,
  ArAgingResponse,
  OperatingSummaryResponse,
  RealizationResponse,
  WipStatsResponse,
} from "./dto/analytics-filter.dto";

@Controller("billing/analytics")
export class BillingAnalyticsController {
  constructor(
    private readonly billingAnalyticsService: BillingAnalyticsService
  ) {}

  @Public()
  @Get("metrics")
  @ApiResponse({ status: 200, description: "Billing metrics summary" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getMetrics(@Query() filterDto: AnalyticsFilterDto): Promise<unknown> {
    // Aggregate key metrics for dashboard
    const [wipStats, realization, operatingSummary, arAging] =
      await Promise.all([
        this.billingAnalyticsService.getWipStats(filterDto),
        this.billingAnalyticsService.getRealizationRates(filterDto),
        this.billingAnalyticsService.getOperatingSummary(filterDto),
        this.billingAnalyticsService.getArAging(filterDto),
      ]);

    return {
      wip: wipStats,
      realization,
      operatingSummary,
      arAging,
    };
  }

  @Public()
  @Get("wip-stats")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getWipStats(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<WipStatsResponse> {
    return await this.billingAnalyticsService.getWipStats(filterDto);
  }

  @Get("realization")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getRealizationRates(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<RealizationResponse> {
    return await this.billingAnalyticsService.getRealizationRates(filterDto);
  }

  @Get("operating-summary")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getOperatingSummary(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<OperatingSummaryResponse> {
    return await this.billingAnalyticsService.getOperatingSummary(filterDto);
  }

  @Get("ar-aging")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getArAging(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<ArAgingResponse> {
    return await this.billingAnalyticsService.getArAging(filterDto);
  }
}
