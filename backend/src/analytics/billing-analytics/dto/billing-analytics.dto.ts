import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BillingPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export class BillingAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for analytics',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for analytics',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by attorney ID',
  })
  @IsOptional()
  @IsString()
  attorneyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by case ID',
  })
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by client ID',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Grouping period',
    enum: BillingPeriod,
    default: BillingPeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(BillingPeriod)
  period?: BillingPeriod = BillingPeriod.MONTH;
}

export class BillingMetricsDto {
  @ApiProperty({ description: 'Total billable hours' })
  totalBillableHours: number;

  @ApiProperty({ description: 'Total non-billable hours' })
  totalNonBillableHours: number;

  @ApiProperty({ description: 'Total billed amount' })
  totalBilled: number;

  @ApiProperty({ description: 'Total collected amount' })
  totalCollected: number;

  @ApiProperty({ description: 'Work in progress (WIP) value' })
  wipValue: number;

  @ApiProperty({ description: 'Accounts receivable (AR) value' })
  arValue: number;

  @ApiProperty({ description: 'Realization rate percentage' })
  realizationRate: number;

  @ApiProperty({ description: 'Collection rate percentage' })
  collectionRate: number;

  @ApiProperty({ description: 'Utilization rate percentage' })
  utilizationRate: number;

  @ApiProperty({ description: 'Average billing rate' })
  avgBillingRate: number;

  @ApiProperty({ description: 'Revenue by practice area' })
  revenueByPracticeArea: { [area: string]: number };

  @ApiProperty({ description: 'Revenue by attorney' })
  revenueByAttorney: AttorneyRevenue[];

  @ApiProperty({ description: 'Billing trends' })
  trends: BillingTrendDataPoint[];
}

export class AttorneyRevenue {
  @ApiProperty({ description: 'Attorney ID' })
  attorneyId: string;

  @ApiProperty({ description: 'Attorney name' })
  attorneyName: string;

  @ApiProperty({ description: 'Billable hours' })
  billableHours: number;

  @ApiProperty({ description: 'Total billed' })
  totalBilled: number;

  @ApiProperty({ description: 'Total collected' })
  totalCollected: number;

  @ApiProperty({ description: 'Realization rate' })
  realizationRate: number;

  @ApiProperty({ description: 'Utilization rate' })
  utilizationRate: number;
}

export class BillingTrendDataPoint {
  @ApiProperty({ description: 'Period label' })
  period: string;

  @ApiProperty({ description: 'Billable hours' })
  billableHours: number;

  @ApiProperty({ description: 'Amount billed' })
  billed: number;

  @ApiProperty({ description: 'Amount collected' })
  collected: number;

  @ApiProperty({ description: 'Realization rate' })
  realizationRate: number;

  @ApiProperty({ description: 'New WIP' })
  newWip: number;

  @ApiProperty({ description: 'New AR' })
  newAr: number;
}

export class WipAgingDto {
  @ApiProperty({ description: 'Total WIP value' })
  totalWip: number;

  @ApiProperty({ description: 'Current (0-30 days)' })
  current: number;

  @ApiProperty({ description: '31-60 days' })
  days31to60: number;

  @ApiProperty({ description: '61-90 days' })
  days61to90: number;

  @ApiProperty({ description: '91-120 days' })
  days91to120: number;

  @ApiProperty({ description: 'Over 120 days' })
  over120: number;

  @ApiProperty({ description: 'WIP by case' })
  wipByCases: CaseWip[];

  @ApiProperty({ description: 'Average WIP age in days' })
  avgWipAge: number;
}

export class CaseWip {
  @ApiProperty({ description: 'Case ID' })
  caseId: string;

  @ApiProperty({ description: 'Case number' })
  caseNumber: string;

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'WIP value' })
  wipValue: number;

  @ApiProperty({ description: 'Age in days' })
  ageInDays: number;

  @ApiProperty({ description: 'Last billed date' })
  lastBilledDate?: Date;

  @ApiProperty({ description: 'Aging category' })
  agingCategory: 'current' | '31-60' | '61-90' | '91-120' | 'over-120';
}

export class ArAgingDto {
  @ApiProperty({ description: 'Total AR value' })
  totalAr: number;

  @ApiProperty({ description: 'Current (0-30 days)' })
  current: number;

  @ApiProperty({ description: '31-60 days' })
  days31to60: number;

  @ApiProperty({ description: '61-90 days' })
  days61to90: number;

  @ApiProperty({ description: '91-120 days' })
  days91to120: number;

  @ApiProperty({ description: 'Over 120 days' })
  over120: number;

  @ApiProperty({ description: 'AR by client' })
  arByClient: ClientAr[];

  @ApiProperty({ description: 'Average AR age in days' })
  avgArAge: number;

  @ApiProperty({ description: 'Days sales outstanding (DSO)' })
  dso: number;
}

export class ClientAr {
  @ApiProperty({ description: 'Client ID' })
  clientId: string;

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'AR value' })
  arValue: number;

  @ApiProperty({ description: 'Age in days' })
  ageInDays: number;

  @ApiProperty({ description: 'Last payment date' })
  lastPaymentDate?: Date;

  @ApiProperty({ description: 'Aging category' })
  agingCategory: 'current' | '31-60' | '61-90' | '91-120' | 'over-120';

  @ApiProperty({ description: 'Collection risk level' })
  riskLevel: 'low' | 'medium' | 'high';
}

export class RealizationAnalysisDto {
  @ApiProperty({ description: 'Overall realization rate' })
  overallRate: number;

  @ApiProperty({ description: 'Realization by practice area' })
  byPracticeArea: PracticeAreaRealization[];

  @ApiProperty({ description: 'Realization by attorney' })
  byAttorney: AttorneyRealization[];

  @ApiProperty({ description: 'Write-off analysis' })
  writeOffAnalysis: {
    totalWriteOffs: number;
    writeOffPercentage: number;
    topReasons: { [reason: string]: number };
  };

  @ApiProperty({ description: 'Discount analysis' })
  discountAnalysis: {
    totalDiscounts: number;
    discountPercentage: number;
    avgDiscountRate: number;
  };
}

export class PracticeAreaRealization {
  @ApiProperty({ description: 'Practice area' })
  practiceArea: string;

  @ApiProperty({ description: 'Standard fees' })
  standardFees: number;

  @ApiProperty({ description: 'Billed fees' })
  billedFees: number;

  @ApiProperty({ description: 'Collected fees' })
  collectedFees: number;

  @ApiProperty({ description: 'Realization rate' })
  realizationRate: number;
}

export class AttorneyRealization {
  @ApiProperty({ description: 'Attorney ID' })
  attorneyId: string;

  @ApiProperty({ description: 'Attorney name' })
  attorneyName: string;

  @ApiProperty({ description: 'Standard rate' })
  standardRate: number;

  @ApiProperty({ description: 'Average billed rate' })
  avgBilledRate: number;

  @ApiProperty({ description: 'Realization rate' })
  realizationRate: number;

  @ApiProperty({ description: 'Total write-offs' })
  totalWriteOffs: number;
}
