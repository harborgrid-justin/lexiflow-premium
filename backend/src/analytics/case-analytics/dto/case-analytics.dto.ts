import { IsOptional, IsDateString, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MetricPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export class CaseMetricsQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for metrics',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for metrics',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by practice area',
    example: 'Corporate Law',
  })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Filter by case status',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Grouping period',
    enum: MetricPeriod,
    default: MetricPeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(MetricPeriod)
  period?: MetricPeriod = MetricPeriod.MONTH;
}

export class CaseMetricsDto {
  @ApiProperty({ description: 'Total number of cases' })
  totalCases!: number;

  @ApiProperty({ description: 'Active cases count' })
  activeCases!: number;

  @ApiProperty({ description: 'Closed cases count' })
  closedCases!: number;

  @ApiProperty({ description: 'Win rate percentage' })
  winRate!: number;

  @ApiProperty({ description: 'Loss rate percentage' })
  lossRate!: number;

  @ApiProperty({ description: 'Settlement rate percentage' })
  settlementRate!: number;

  @ApiProperty({ description: 'Average case duration in days' })
  avgCaseDuration!: number;

  @ApiProperty({ description: 'Median case duration in days' })
  medianCaseDuration!: number;

  @ApiProperty({ description: 'Average case value' })
  avgCaseValue!: number;

  @ApiProperty({ description: 'Total revenue generated' })
  totalRevenue!: number;

  @ApiProperty({ description: 'Cases by status breakdown' })
  casesByStatus: { [status: string]: number };

  @ApiProperty({ description: 'Cases by practice area breakdown' })
  casesByPracticeArea: { [area: string]: number };

  @ApiProperty({ description: 'Monthly trend data' })
  trends?: CaseTrendDataPoint[];
}

export class CaseTrendDataPoint {
  @ApiProperty({ description: 'Period label' })
  period!: string;

  @ApiProperty({ description: 'Number of new cases' })
  newCases!: number;

  @ApiProperty({ description: 'Number of closed cases' })
  closedCases!: number;

  @ApiProperty({ description: 'Win rate for period' })
  winRate!: number;

  @ApiProperty({ description: 'Average duration for period' })
  avgDuration!: number;

  @ApiProperty({ description: 'Revenue for period' })
  revenue!: number;
}

export class CaseSpecificMetricsDto {
  @ApiProperty({ description: 'Case ID' })
  caseId!: string;

  @ApiProperty({ description: 'Case number' })
  caseNumber!: string;

  @ApiProperty({ description: 'Case title' })
  title!: string;

  @ApiProperty({ description: 'Days since case opened' })
  daysOpen!: number;

  @ApiProperty({ description: 'Total billable hours' })
  totalHours!: number;

  @ApiProperty({ description: 'Total billed amount' })
  totalBilled!: number;

  @ApiProperty({ description: 'Total collected amount' })
  totalCollected!: number;

  @ApiProperty({ description: 'Realization rate percentage' })
  realizationRate!: number;

  @ApiProperty({ description: 'Number of documents' })
  documentCount!: number;

  @ApiProperty({ description: 'Number of motions filed' })
  motionCount!: number;

  @ApiProperty({ description: 'Number of hearings' })
  hearingCount!: number;

  @ApiProperty({ description: 'Number of depositions' })
  depositionCount!: number;

  @ApiProperty({ description: 'Team utilization rate' })
  teamUtilization!: number;

  @ApiProperty({ description: 'Upcoming deadlines count' })
  upcomingDeadlines!: number;

  @ApiProperty({ description: 'Overdue tasks count' })
  overdueTasks!: number;

  @ApiProperty({ description: 'Activity timeline' })
  activityTimeline!: ActivityDataPoint[];
}

export class ActivityDataPoint {
  @ApiProperty({ description: 'Date of activity' })
  date!: string;

  @ApiProperty({ description: 'Activity type' })
  type!: string;

  @ApiProperty({ description: 'Activity description' })
  description!: string;

  @ApiProperty({ description: 'Associated value/count' })
  value!: number;
}

export class PracticeAreaBreakdownDto {
  @ApiProperty({ description: 'Practice area name' })
  practiceArea!: string;

  @ApiProperty({ description: 'Number of cases' })
  caseCount!: number;

  @ApiProperty({ description: 'Active cases' })
  activeCases!: number;

  @ApiProperty({ description: 'Total revenue' })
  revenue!: number;

  @ApiProperty({ description: 'Win rate percentage' })
  winRate!: number;

  @ApiProperty({ description: 'Average case duration' })
  avgDuration!: number;

  @ApiProperty({ description: 'Percentage of total cases' })
  percentage!: number;
}
