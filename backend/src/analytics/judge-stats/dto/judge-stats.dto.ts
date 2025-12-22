import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MotionType {
  DISMISS = 'dismiss',
  SUMMARY_JUDGMENT = 'summary_judgment',
  COMPEL = 'compel',
  PROTECTIVE_ORDER = 'protective_order',
  EXTENSION = 'extension',
  SANCTIONS = 'sanctions',
  OTHER = 'other',
}

export class JudgeStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for statistics',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for statistics',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by practice area',
  })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Filter by motion type',
    enum: MotionType,
  })
  @IsOptional()
  @IsEnum(MotionType)
  motionType?: MotionType;
}

export class JudgeStatsDto {
  @ApiProperty({ description: 'Judge ID' })
  judgeId!: string;

  @ApiProperty({ description: 'Judge name' })
  judgeName!: string;

  @ApiProperty({ description: 'Court name' })
  court!: string;

  @ApiProperty({ description: 'Total cases presided' })
  totalCases!: number;

  @ApiProperty({ description: 'Active cases count' })
  activeCases!: number;

  @ApiProperty({ description: 'Average case duration in days' })
  avgCaseDuration!: number;

  @ApiProperty({ description: 'Median case duration in days' })
  medianCaseDuration!: number;

  @ApiProperty({ description: 'Overall plaintiff win rate percentage' })
  plaintiffWinRate!: number;

  @ApiProperty({ description: 'Overall defendant win rate percentage' })
  defendantWinRate!: number;

  @ApiProperty({ description: 'Settlement rate percentage' })
  settlementRate!: number;

  @ApiProperty({ description: 'Trial rate percentage' })
  trialRate!: number;

  @ApiProperty({ description: 'Motion grant rate statistics' })
  motionGrantRates!: MotionGrantRate[];

  @ApiProperty({ description: 'Cases by outcome' })
  casesByOutcome: { [outcome: string]: number };

  @ApiProperty({ description: 'Average days to ruling on motions' })
  avgDaysToRuling!: number;

  @ApiProperty({ description: 'Disposition methods breakdown' })
  dispositionMethods: { [method: string]: number };
}

export class MotionGrantRate {
  @ApiProperty({ description: 'Motion type', enum: MotionType })
  motionType!: MotionType;

  @ApiProperty({ description: 'Total motions of this type' })
  totalMotions!: number;

  @ApiProperty({ description: 'Granted motions count' })
  granted!: number;

  @ApiProperty({ description: 'Denied motions count' })
  denied!: number;

  @ApiProperty({ description: 'Partially granted count' })
  partiallyGranted!: number;

  @ApiProperty({ description: 'Grant rate percentage' })
  grantRate!: number;

  @ApiProperty({ description: 'Denial rate percentage' })
  denialRate!: number;

  @ApiProperty({ description: 'Average days to decision' })
  avgDaysToDecision!: number;
}

export class JudgeMotionStatsDto {
  @ApiProperty({ description: 'Judge ID' })
  judgeId!: string;

  @ApiProperty({ description: 'Judge name' })
  judgeName!: string;

  @ApiProperty({ description: 'Motion statistics by type' })
  motionStats!: MotionGrantRate[];

  @ApiProperty({ description: 'Overall motion grant rate' })
  overallGrantRate!: number;

  @ApiProperty({ description: 'Total motions analyzed' })
  totalMotions!: number;

  @ApiProperty({ description: 'Trending data for motion grants' })
  trends!: MotionTrendDataPoint[];
}

export class MotionTrendDataPoint {
  @ApiProperty({ description: 'Period label' })
  period!: string;

  @ApiProperty({ description: 'Motion type' })
  motionType!: MotionType;

  @ApiProperty({ description: 'Grant rate for period' })
  grantRate!: number;

  @ApiProperty({ description: 'Number of motions' })
  count!: number;
}

export class JudgeCaseDurationDto {
  @ApiProperty({ description: 'Judge ID' })
  judgeId!: string;

  @ApiProperty({ description: 'Judge name' })
  judgeName!: string;

  @ApiProperty({ description: 'Average duration in days' })
  avgDuration!: number;

  @ApiProperty({ description: 'Median duration in days' })
  medianDuration!: number;

  @ApiProperty({ description: 'Minimum duration in days' })
  minDuration!: number;

  @ApiProperty({ description: 'Maximum duration in days' })
  maxDuration!: number;

  @ApiProperty({ description: 'Standard deviation' })
  stdDeviation!: number;

  @ApiProperty({ description: 'Duration by case type' })
  durationByType!: DurationByType[];

  @ApiProperty({ description: 'Duration percentiles' })
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

export class DurationByType {
  @ApiProperty({ description: 'Case type' })
  caseType!: string;

  @ApiProperty({ description: 'Average duration' })
  avgDuration!: number;

  @ApiProperty({ description: 'Number of cases' })
  caseCount!: number;
}

export class JudgeListItemDto {
  @ApiProperty({ description: 'Judge ID' })
  id!: string;

  @ApiProperty({ description: 'Judge name' })
  name!: string;

  @ApiProperty({ description: 'Court name' })
  court!: string;

  @ApiProperty({ description: 'Total cases' })
  totalCases!: number;

  @ApiProperty({ description: 'Average case duration' })
  avgDuration!: number;

  @ApiProperty({ description: 'Plaintiff win rate' })
  plaintiffWinRate!: number;

  @ApiProperty({ description: 'Last updated' })
  lastUpdated!: Date;
}
