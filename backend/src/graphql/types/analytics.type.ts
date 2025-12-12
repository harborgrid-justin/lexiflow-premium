import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { CaseType } from './case.type';

@ObjectType()
export class DashboardMetrics {
  @Field(() => Int)
  totalCases: number;

  @Field(() => Int)
  activeCases: number;

  @Field(() => Int)
  closedCases: number;

  @Field(() => Int)
  totalDocuments: number;

  @Field(() => Int)
  pendingReviews: number;

  @Field(() => Int)
  upcomingDeadlines: number;

  @Field(() => Float)
  totalBillableHours: number;

  @Field(() => String)
  totalRevenue: string; // Money scalar

  @Field(() => Float)
  collectionRate: number;

  @Field(() => Date)
  generatedAt: Date;
}

@ObjectType()
export class CaseAnalytics {
  @Field(() => ID)
  caseId: string;

  @Field(() => String)
  caseNumber: string;

  @Field(() => String)
  caseTitle: string;

  @Field(() => Int)
  totalDocuments: number;

  @Field(() => Int)
  totalMotions: number;

  @Field(() => Int)
  totalHearings: number;

  @Field(() => Float)
  totalHours: number;

  @Field(() => String)
  totalCost: string; // Money scalar

  @Field(() => Int)
  daysOpen: number;

  @Field(() => Int)
  teamSize: number;

  @Field(() => Float, { nullable: true })
  winProbability?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class JudgeStatistics {
  @Field(() => ID)
  id: string;

  @Field()
  judgeName: string;

  @Field({ nullable: true })
  court?: string;

  @Field(() => Int)
  totalCases: number;

  @Field(() => Int)
  decisionsGranted: number;

  @Field(() => Int)
  decisionsDenied: number;

  @Field(() => Float)
  grantRate: number;

  @Field(() => Float)
  avgDaysToDecision: number;

  @Field(() => [String], { nullable: true })
  commonIssues?: string[];

  @Field(() => Date)
  lastUpdated: Date;
}

@ObjectType()
export class BillingAnalytics {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  totalHours: number;

  @Field(() => String)
  totalRevenue: string; // Money scalar

  @Field(() => String)
  totalCollected: string; // Money scalar

  @Field(() => String)
  totalOutstanding: string; // Money scalar

  @Field(() => Float)
  collectionRate: number;

  @Field(() => Int)
  invoicesSent: number;

  @Field(() => Int)
  invoicesPaid: number;

  @Field(() => Int)
  invoicesOverdue: number;

  @Field(() => [RevenueByAttorney])
  byAttorney: RevenueByAttorney[];

  @Field(() => [RevenueByCase])
  byCase: RevenueByCase[];

  @Field(() => [RevenueByMonth])
  byMonth: RevenueByMonth[];
}

@ObjectType()
export class RevenueByAttorney {
  @Field(() => ID)
  userId: string;

  @Field()
  userName: string;

  @Field(() => Float)
  hours: number;

  @Field(() => String)
  revenue: string; // Money scalar

  @Field(() => Int)
  casesWorked: number;
}

@ObjectType()
export class RevenueByCase {
  @Field(() => ID)
  caseId: string;

  @Field()
  caseNumber: string;

  @Field(() => Float)
  hours: number;

  @Field(() => String)
  revenue: string; // Money scalar
}

@ObjectType()
export class RevenueByMonth {
  @Field()
  month: string;

  @Field(() => Float)
  hours: number;

  @Field(() => String)
  revenue: string; // Money scalar

  @Field(() => Int)
  invoices: number;
}

@ObjectType()
export class DiscoveryAnalytics {
  @Field(() => ID)
  caseId: string;

  @Field(() => Int)
  totalRequests: number;

  @Field(() => Int)
  requestsCompleted: number;

  @Field(() => Int)
  requestsPending: number;

  @Field(() => Int)
  requestsOverdue: number;

  @Field(() => Float)
  completionRate: number;

  @Field(() => Float)
  avgDaysToCompletion: number;

  @Field(() => Int)
  totalDocumentsProduced: number;

  @Field(() => Int)
  totalDocumentsReceived: number;

  @Field(() => Date)
  lastUpdated: Date;
}

@ObjectType()
export class OutcomePrediction {
  @Field(() => ID)
  caseId: string;

  @Field(() => String)
  caseNumber: string;

  @Field()
  caseType: string;

  @Field(() => Float)
  winProbability: number;

  @Field(() => Float)
  settlementProbability: number;

  @Field(() => String, { nullable: true })
  estimatedSettlementAmount?: string; // Money scalar

  @Field(() => Int, { nullable: true })
  estimatedDaysToResolution?: number;

  @Field(() => [String])
  keyFactors: string[];

  @Field(() => [CaseType])
  similarCases: CaseType[];

  @Field(() => Float)
  confidenceScore: number;

  @Field(() => Date)
  predictedAt: Date;
}

@ObjectType()
export class TimeSeriesDataPoint {
  @Field(() => Date)
  timestamp: Date;

  @Field(() => Float)
  value: number;

  @Field({ nullable: true })
  label?: string;
}

@ObjectType()
export class TrendAnalysis {
  @Field()
  metric: string;

  @Field()
  period: string;

  @Field(() => [TimeSeriesDataPoint])
  data: TimeSeriesDataPoint[];

  @Field(() => Float)
  trend: number; // positive = increasing, negative = decreasing

  @Field(() => Float, { nullable: true })
  forecast?: number;

  @Field(() => Date)
  generatedAt: Date;
}

@ObjectType()
export class PerformanceMetrics {
  @Field(() => ID)
  userId: string;

  @Field()
  userName: string;

  @Field(() => Float)
  totalHours: number;

  @Field(() => String)
  totalRevenue: string; // Money scalar

  @Field(() => Int)
  casesHandled: number;

  @Field(() => Int)
  casesWon: number;

  @Field(() => Int)
  casesLost: number;

  @Field(() => Float)
  winRate: number;

  @Field(() => Float)
  avgCaseDuration: number;

  @Field(() => Float)
  utilizationRate: number;

  @Field()
  period: string;
}
