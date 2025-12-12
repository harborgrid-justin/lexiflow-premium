import { IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscoveryAnalyticsQueryDto {
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
    description: 'Filter by case ID',
  })
  @IsOptional()
  @IsString()
  caseId?: string;
}

export class DiscoveryFunnelDto {
  @ApiProperty({ description: 'Total discovery requests sent' })
  requestsSent: number;

  @ApiProperty({ description: 'Requests awaiting response' })
  requestsPending: number;

  @ApiProperty({ description: 'Requests with partial responses' })
  requestsPartiallyResponded: number;

  @ApiProperty({ description: 'Requests fully responded' })
  requestsFullyResponded: number;

  @ApiProperty({ description: 'Requests with objections' })
  requestsWithObjections: number;

  @ApiProperty({ description: 'Documents produced' })
  documentsProduced: number;

  @ApiProperty({ description: 'Documents reviewed' })
  documentsReviewed: number;

  @ApiProperty({ description: 'Documents privileged' })
  documentsPrivileged: number;

  @ApiProperty({ description: 'Documents responsive' })
  documentsResponsive: number;

  @ApiProperty({ description: 'Average response time in days' })
  avgResponseTime: number;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;

  @ApiProperty({ description: 'Funnel stages breakdown' })
  stages: FunnelStage[];
}

export class FunnelStage {
  @ApiProperty({ description: 'Stage name' })
  name: string;

  @ApiProperty({ description: 'Item count at this stage' })
  count: number;

  @ApiProperty({ description: 'Percentage of total' })
  percentage: number;

  @ApiProperty({ description: 'Average time in stage (days)' })
  avgTimeInStage: number;

  @ApiProperty({ description: 'Stage status' })
  status: 'on-track' | 'delayed' | 'at-risk';
}

export class DiscoveryTimelineDto {
  @ApiProperty({ description: 'Timeline events' })
  events: TimelineEvent[];

  @ApiProperty({ description: 'Critical path items' })
  criticalPath: TimelineEvent[];

  @ApiProperty({ description: 'Upcoming milestones' })
  upcomingMilestones: Milestone[];

  @ApiProperty({ description: 'Overdue items count' })
  overdueCount: number;

  @ApiProperty({ description: 'Discovery cutoff date' })
  discoveryCutoff?: Date;

  @ApiProperty({ description: 'Days until cutoff' })
  daysUntilCutoff?: number;

  @ApiProperty({ description: 'Overall status' })
  overallStatus: 'on-schedule' | 'delayed' | 'critical';
}

export class TimelineEvent {
  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Event type' })
  type: 'request' | 'response' | 'production' | 'deposition' | 'motion' | 'deadline';

  @ApiProperty({ description: 'Event title' })
  title: string;

  @ApiProperty({ description: 'Event date' })
  date: Date;

  @ApiProperty({ description: 'Associated case ID' })
  caseId?: string;

  @ApiProperty({ description: 'Status' })
  status: 'completed' | 'pending' | 'overdue' | 'upcoming';

  @ApiProperty({ description: 'Details' })
  details?: string;

  @ApiProperty({ description: 'Is critical path item' })
  isCritical: boolean;
}

export class Milestone {
  @ApiProperty({ description: 'Milestone name' })
  name: string;

  @ApiProperty({ description: 'Due date' })
  dueDate: Date;

  @ApiProperty({ description: 'Days until due' })
  daysUntil: number;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;

  @ApiProperty({ description: 'Status' })
  status: 'on-track' | 'at-risk' | 'overdue';

  @ApiProperty({ description: 'Dependencies' })
  dependencies: string[];
}

export class CaseDiscoveryMetricsDto {
  @ApiProperty({ description: 'Case ID' })
  caseId: string;

  @ApiProperty({ description: 'Total requests sent' })
  requestsSent: number;

  @ApiProperty({ description: 'Total requests received' })
  requestsReceived: number;

  @ApiProperty({ description: 'Response rate percentage' })
  responseRate: number;

  @ApiProperty({ description: 'Documents produced' })
  documentsProduced: number;

  @ApiProperty({ description: 'Documents received' })
  documentsReceived: number;

  @ApiProperty({ description: 'Depositions scheduled' })
  depositionsScheduled: number;

  @ApiProperty({ description: 'Depositions completed' })
  depositionsCompleted: number;

  @ApiProperty({ description: 'Average response time in days' })
  avgResponseTime: number;

  @ApiProperty({ description: 'Objections filed' })
  objectionsCount: number;

  @ApiProperty({ description: 'Motions to compel filed' })
  motionsToCompel: number;

  @ApiProperty({ description: 'Discovery disputes count' })
  disputesCount: number;

  @ApiProperty({ description: 'ESI sources identified' })
  esiSourcesCount: number;

  @ApiProperty({ description: 'Total discovery cost' })
  totalCost: number;

  @ApiProperty({ description: 'Cost per document' })
  costPerDocument: number;
}

export class DiscoveryProductionVolumeDto {
  @ApiProperty({ description: 'Total documents' })
  totalDocuments: number;

  @ApiProperty({ description: 'Documents by type' })
  documentsByType: { [type: string]: number };

  @ApiProperty({ description: 'Documents by custodian' })
  documentsByCustodian: { [custodian: string]: number };

  @ApiProperty({ description: 'Documents by date range' })
  documentsByDateRange: DateRangeVolume[];

  @ApiProperty({ description: 'File size statistics' })
  fileSizeStats: {
    totalBytes: number;
    avgBytes: number;
    totalGB: number;
  };

  @ApiProperty({ description: 'Production batches' })
  productionBatches: ProductionBatch[];
}

export class DateRangeVolume {
  @ApiProperty({ description: 'Date range label' })
  range: string;

  @ApiProperty({ description: 'Document count' })
  count: number;

  @ApiProperty({ description: 'Percentage of total' })
  percentage: number;
}

export class ProductionBatch {
  @ApiProperty({ description: 'Batch number' })
  batchNumber: string;

  @ApiProperty({ description: 'Production date' })
  productionDate: Date;

  @ApiProperty({ description: 'Document count' })
  documentCount: number;

  @ApiProperty({ description: 'Status' })
  status: 'pending' | 'produced' | 'supplemented';
}
