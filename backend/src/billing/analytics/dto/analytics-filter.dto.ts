import { IsOptional, IsString, IsDateString } from 'class-validator';

export class AnalyticsFilterDto {
  @IsOptional()
  @IsString()
  firmId?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class WipStatsResponse {
  totalWip!: number;
  unbilledTime!: number;
  unbilledExpenses!: number;
  wipByCase!: Array<{
    caseId: string;
    caseName: string;
    wipAmount: number;
    ageInDays: number;
  }>;
  wipByAttorney!: Array<{
    userId: string;
    userName: string;
    wipAmount: number;
    hours: number;
  }>;
  wipAging!: {
    current: number;    // 0-30 days
    days30: number;     // 31-60 days
    days60: number;     // 61-90 days
    days90: number;     // 91-120 days
    over120: number;    // 120+ days
  };
}

export class RealizationResponse {
  realizationRate!: number;        // Overall realization %
  standardAmount!: number;          // Standard/billed amount
  collectedAmount!: number;         // Actually collected
  writeOffs!: number;               // Write-offs
  discounts!: number;               // Discounts given
  byAttorney!: Array<{
    userId: string;
    userName: string;
    realizationRate: number;
    standardAmount: number;
    collectedAmount: number;
  }>;
  byPracticeArea!: Array<{
    area: string;
    realizationRate: number;
    standardAmount: number;
    collectedAmount: number;
  }>;
  trend!: Array<{
    month: string;
    realizationRate: number;
  }>;
}

export class OperatingSummaryResponse {
  totalRevenue!: number;
  totalExpenses!: number;
  netIncome!: number;
  outstandingAR!: number;
  averageCollectionDays!: number;
  activeMatters!: number;
  billableHours!: number;
  averageHourlyRate!: number;
  revenueByMonth!: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  topClients!: Array<{
    clientId: string;
    clientName: string;
    revenue: number;
    percentOfTotal: number;
  }>;
}

export class ArAgingResponse {
  totalAR!: number;
  current!: number;        // Not yet due
  days30!: number;         // 1-30 days overdue
  days60!: number;         // 31-60 days overdue
  days90!: number;         // 61-90 days overdue
  over90!: number;         // 90+ days overdue
  byClient!: Array<{
    clientId: string;
    clientName: string;
    totalDue: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    oldestInvoiceDate: string;
  }>;
}
