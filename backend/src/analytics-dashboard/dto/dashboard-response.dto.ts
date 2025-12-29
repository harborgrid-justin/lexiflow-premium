import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * KPI Response DTO
 */
export class KPIDto {
  @ApiProperty({ description: 'KPI identifier' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'KPI name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Current value' })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional({ description: 'Previous period value for comparison' })
  @IsOptional()
  @IsNumber()
  previousValue?: number;

  @ApiPropertyOptional({ description: 'Percentage change from previous period' })
  @IsOptional()
  @IsNumber()
  changePercentage?: number;

  @ApiPropertyOptional({ description: 'Target value' })
  @IsOptional()
  @IsNumber()
  target?: number;

  @ApiPropertyOptional({ description: 'Unit of measurement (e.g., $, %, count)' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Trend direction (up, down, stable)' })
  @IsOptional()
  @IsString()
  trend?: 'up' | 'down' | 'stable';
}

export class KPIsResponseDto {
  @ApiProperty({ type: [KPIDto], description: 'List of KPIs' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KPIDto)
  kpis!: KPIDto[];

  @ApiProperty({ description: 'Period for which KPIs were calculated' })
  @IsString()
  period!: string;

  @ApiPropertyOptional({ description: 'Start date of the period' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date of the period' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

/**
 * Case Metrics Response DTO
 */
export class CaseMetricsResponseDto {
  @ApiProperty({ description: 'Total number of cases' })
  @IsNumber()
  totalCases!: number;

  @ApiProperty({ description: 'Active cases count' })
  @IsNumber()
  activeCases!: number;

  @ApiProperty({ description: 'Closed cases count' })
  @IsNumber()
  closedCases!: number;

  @ApiProperty({ description: 'Pending cases count' })
  @IsNumber()
  pendingCases!: number;

  @ApiProperty({ description: 'Cases by status', type: 'object', additionalProperties: true })
  @IsObject()
  casesByStatus!: Record<string, number>;

  @ApiProperty({ description: 'Cases by type', type: 'object', additionalProperties: true })
  @IsObject()
  casesByType!: Record<string, number>;

  @ApiPropertyOptional({ description: 'Average case duration in days' })
  @IsOptional()
  @IsNumber()
  averageDuration?: number;

  @ApiPropertyOptional({ description: 'Case win rate percentage' })
  @IsOptional()
  @IsNumber()
  winRate?: number;

  @ApiPropertyOptional({ description: 'Cases opened this period' })
  @IsOptional()
  @IsNumber()
  newCases?: number;

  @ApiPropertyOptional({ description: 'Cases closed this period' })
  @IsOptional()
  @IsNumber()
  closedThisPeriod?: number;
}

/**
 * Financial Metrics Response DTO
 */
export class FinancialMetricsResponseDto {
  @ApiProperty({ description: 'Total revenue' })
  @IsNumber()
  totalRevenue!: number;

  @ApiProperty({ description: 'Outstanding receivables' })
  @IsNumber()
  outstandingReceivables!: number;

  @ApiProperty({ description: 'Collected revenue' })
  @IsNumber()
  collectedRevenue!: number;

  @ApiProperty({ description: 'Total billable hours' })
  @IsNumber()
  totalBillableHours!: number;

  @ApiProperty({ description: 'Average hourly rate' })
  @IsNumber()
  averageHourlyRate!: number;

  @ApiProperty({ description: 'Revenue by practice area', type: 'object', additionalProperties: true })
  @IsObject()
  revenueByPracticeArea!: Record<string, number>;

  @ApiPropertyOptional({ description: 'Collection rate percentage' })
  @IsOptional()
  @IsNumber()
  collectionRate?: number;

  @ApiPropertyOptional({ description: 'Revenue growth percentage' })
  @IsOptional()
  @IsNumber()
  revenueGrowth?: number;

  @ApiPropertyOptional({ description: 'Outstanding invoices count' })
  @IsOptional()
  @IsNumber()
  outstandingInvoices?: number;

  @ApiPropertyOptional({ description: 'Paid invoices count' })
  @IsOptional()
  @IsNumber()
  paidInvoices?: number;
}

/**
 * Team Performance Response DTO
 */
export class TeamMemberPerformanceDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'User name' })
  @IsString()
  userName!: string;

  @ApiProperty({ description: 'Total billable hours' })
  @IsNumber()
  billableHours!: number;

  @ApiProperty({ description: 'Number of cases handled' })
  @IsNumber()
  casesHandled!: number;

  @ApiProperty({ description: 'Revenue generated' })
  @IsNumber()
  revenueGenerated!: number;

  @ApiPropertyOptional({ description: 'Utilization rate percentage' })
  @IsOptional()
  @IsNumber()
  utilizationRate?: number;

  @ApiPropertyOptional({ description: 'Average case duration' })
  @IsOptional()
  @IsNumber()
  averageCaseDuration?: number;
}

export class TeamPerformanceResponseDto {
  @ApiProperty({ type: [TeamMemberPerformanceDto], description: 'Team member performance metrics' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberPerformanceDto)
  teamMembers!: TeamMemberPerformanceDto[];

  @ApiProperty({ description: 'Overall team utilization rate' })
  @IsNumber()
  overallUtilizationRate!: number;

  @ApiProperty({ description: 'Total team billable hours' })
  @IsNumber()
  totalBillableHours!: number;

  @ApiProperty({ description: 'Total team revenue' })
  @IsNumber()
  totalRevenue!: number;

  @ApiPropertyOptional({ description: 'Top performer user ID' })
  @IsOptional()
  @IsString()
  topPerformerId?: string;
}

/**
 * Client Metrics Response DTO
 */
export class ClientMetricDto {
  @ApiProperty({ description: 'Client ID' })
  @IsString()
  clientId!: string;

  @ApiProperty({ description: 'Client name' })
  @IsString()
  clientName!: string;

  @ApiProperty({ description: 'Total revenue from client' })
  @IsNumber()
  totalRevenue!: number;

  @ApiProperty({ description: 'Active cases count' })
  @IsNumber()
  activeCases!: number;

  @ApiProperty({ description: 'Outstanding balance' })
  @IsNumber()
  outstandingBalance!: number;

  @ApiPropertyOptional({ description: 'Lifetime value' })
  @IsOptional()
  @IsNumber()
  lifetimeValue?: number;

  @ApiPropertyOptional({ description: 'Last activity date' })
  @IsOptional()
  @IsString()
  lastActivityDate?: string;
}

export class ClientMetricsResponseDto {
  @ApiProperty({ type: [ClientMetricDto], description: 'Client metrics' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientMetricDto)
  clients!: ClientMetricDto[];

  @ApiProperty({ description: 'Total number of active clients' })
  @IsNumber()
  totalActiveClients!: number;

  @ApiProperty({ description: 'Total revenue from all clients' })
  @IsNumber()
  totalRevenue!: number;

  @ApiPropertyOptional({ description: 'Average client lifetime value' })
  @IsOptional()
  @IsNumber()
  averageLifetimeValue?: number;

  @ApiPropertyOptional({ description: 'Top client by revenue' })
  @IsOptional()
  @IsString()
  topClientId?: string;
}

/**
 * Chart Data Response DTO
 */
export class ChartDataPointDto {
  @ApiProperty({ description: 'Label for data point' })
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Value for data point' })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional({ description: 'Timestamp for time-series data' })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ChartDataResponseDto {
  @ApiProperty({ description: 'Chart type' })
  @IsString()
  chartType!: string;

  @ApiProperty({ type: [ChartDataPointDto], description: 'Chart data points' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChartDataPointDto)
  data!: ChartDataPointDto[];

  @ApiPropertyOptional({ description: 'Chart title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'X-axis label' })
  @IsOptional()
  @IsString()
  xAxisLabel?: string;

  @ApiPropertyOptional({ description: 'Y-axis label' })
  @IsOptional()
  @IsString()
  yAxisLabel?: string;
}

/**
 * Dashboard Statistics Response DTO
 */
export class DashboardStatsResponseDto {
  @ApiProperty({ description: 'Total active users' })
  @IsNumber()
  totalActiveUsers!: number;

  @ApiProperty({ description: 'Total cases' })
  @IsNumber()
  totalCases!: number;

  @ApiProperty({ description: 'Total clients' })
  @IsNumber()
  totalClients!: number;

  @ApiProperty({ description: 'Total revenue' })
  @IsNumber()
  totalRevenue!: number;

  @ApiProperty({ description: 'Active tasks count' })
  @IsNumber()
  activeTasks!: number;

  @ApiProperty({ description: 'Pending invoices count' })
  @IsNumber()
  pendingInvoices!: number;

  @ApiPropertyOptional({ description: 'Recent activity count' })
  @IsOptional()
  @IsNumber()
  recentActivity?: number;

  @ApiPropertyOptional({ description: 'System health status' })
  @IsOptional()
  @IsString()
  systemHealth?: string;

  @ApiPropertyOptional({ description: 'Last updated timestamp' })
  @IsOptional()
  @IsString()
  lastUpdated?: string;
}
