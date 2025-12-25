import { ApiProperty } from '@nestjs/swagger';

export class CaseStatsDto {
  @ApiProperty({ description: 'Total number of active cases' })
  totalActive: number;

  @ApiProperty({ description: 'Number of cases in intake pipeline' })
  intakePipeline: number;

  @ApiProperty({ description: 'Number of cases with upcoming deadlines (next 7 days)' })
  upcomingDeadlines: number;

  @ApiProperty({ description: 'Number of at-risk cases' })
  atRisk: number;

  @ApiProperty({ description: 'Total estimated value of active cases' })
  totalValue: number;

  @ApiProperty({ description: 'Resource utilization rate (percentage)' })
  utilizationRate: number;

  @ApiProperty({ description: 'Average age of active cases in days' })
  averageAge: number;

  @ApiProperty({ description: 'Lead conversion rate (percentage)' })
  conversionRate: number;
}
