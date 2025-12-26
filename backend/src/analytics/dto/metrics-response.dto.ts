import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaseMetricsDto {
  @ApiProperty({ description: 'Total number of cases' })
  totalCases!: number;

  @ApiProperty({ description: 'Number of active cases' })
  activeCases!: number;

  @ApiProperty({ description: 'Number of closed cases' })
  closedCases!: number;

  @ApiProperty({ description: 'Number of cases by status' })
  casesByStatus!: Record<string, number>;

  @ApiPropertyOptional({ description: 'Average case duration in days' })
  averageDuration?: number;

  @ApiPropertyOptional({ description: 'Cases by type' })
  casesByType?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Additional metrics data' })
  additionalMetrics?: Record<string, unknown>;
}

export class UserActivityMetricsDto {
  @ApiProperty({ description: 'Total active users' })
  totalActiveUsers!: number;

  @ApiProperty({ description: 'Daily active users' })
  dailyActiveUsers!: number;

  @ApiProperty({ description: 'User activity by type' })
  activityByType!: Record<string, number>;

  @ApiPropertyOptional({ description: 'Average session duration in minutes' })
  averageSessionDuration?: number;

  @ApiPropertyOptional({ description: 'User engagement metrics' })
  engagementMetrics?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Additional metrics data' })
  additionalMetrics?: Record<string, unknown>;
}

export class BillingMetricsDto {
  @ApiProperty({ description: 'Total revenue' })
  totalRevenue!: number;

  @ApiProperty({ description: 'Outstanding balance' })
  outstandingBalance!: number;

  @ApiProperty({ description: 'Number of paid invoices' })
  paidInvoices!: number;

  @ApiProperty({ description: 'Number of pending invoices' })
  pendingInvoices!: number;

  @ApiPropertyOptional({ description: 'Revenue by period' })
  revenueByPeriod?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Average invoice value' })
  averageInvoiceValue?: number;

  @ApiPropertyOptional({ description: 'Payment collection rate percentage' })
  collectionRate?: number;

  @ApiPropertyOptional({ description: 'Additional metrics data' })
  additionalMetrics?: Record<string, unknown>;
}

export class TimeSeriesDataPointDto {
  @ApiProperty({ description: 'Timestamp of the data point' })
  timestamp!: string;

  @ApiProperty({ description: 'Value at this timestamp' })
  value!: number;

  @ApiPropertyOptional({ description: 'Label for this data point' })
  label?: string;

  @ApiPropertyOptional({ description: 'Additional data' })
  metadata?: Record<string, unknown>;
}
