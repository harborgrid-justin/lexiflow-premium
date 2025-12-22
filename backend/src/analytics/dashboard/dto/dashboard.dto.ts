import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Number of days to look back',
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  daysBack?: number = 30;
}

// Define all leaf classes first (classes with no class dependencies)

export class ChartDataset {
  @ApiProperty({ description: 'Dataset label' })
  label!: string;

  @ApiProperty({ description: 'Data values' })
  data!: number[];

  @ApiProperty({ description: 'Background color' })
  backgroundColor?: string | string[];

  @ApiProperty({ description: 'Border color' })
  borderColor?: string;
}

export class ChartData {
  @ApiProperty({ description: 'Data labels' })
  labels!: string[];

  @ApiProperty({ description: 'Datasets', type: [ChartDataset] })
  datasets!: ChartDataset[];
}

export class DashboardChart {
  @ApiProperty({ description: 'Chart ID' })
  id!: string;

  @ApiProperty({ description: 'Chart title' })
  title!: string;

  @ApiProperty({ description: 'Chart type' })
  type!: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';

  @ApiProperty({ description: 'Chart data', type: ChartData })
  data!: ChartData;
}

export class QuickStat {
  @ApiProperty({ description: 'Stat label' })
  label!: string;

  @ApiProperty({ description: 'Stat value' })
  value!: string | number;

  @ApiProperty({ description: 'Icon name' })
  icon?: string;

  @ApiProperty({ description: 'Color theme' })
  color?: string;

  @ApiProperty({ description: 'Link URL' })
  link?: string;
}

export class DashboardSummary {
  @ApiProperty({ description: 'Total active cases' })
  activeCases!: number;

  @ApiProperty({ description: 'Cases won this period' })
  casesWon!: number;

  @ApiProperty({ description: 'Total revenue this period' })
  totalRevenue!: number;

  @ApiProperty({ description: 'Revenue change percentage' })
  revenueChange!: number;

  @ApiProperty({ description: 'Total billable hours' })
  billableHours!: number;

  @ApiProperty({ description: 'Billable hours change percentage' })
  hoursChange!: number;

  @ApiProperty({ description: 'Active clients count' })
  activeClients!: number;

  @ApiProperty({ description: 'Pending tasks count' })
  pendingTasks!: number;

  @ApiProperty({ description: 'Upcoming deadlines count' })
  upcomingDeadlines!: number;

  @ApiProperty({ description: 'Overdue items count' })
  overdueItems!: number;
}

export class ActivityItem {
  @ApiProperty({ description: 'Activity ID' })
  id!: string;

  @ApiProperty({ description: 'Activity type' })
  type!: 'case' | 'document' | 'motion' | 'billing' | 'deadline' | 'message';

  @ApiProperty({ description: 'Activity title' })
  title!: string;

  @ApiProperty({ description: 'Activity description' })
  description!: string;

  @ApiProperty({ description: 'Timestamp' })
  timestamp!: Date;

  @ApiProperty({ description: 'Related entity ID' })
  entityId?: string;

  @ApiProperty({ description: 'Related entity type' })
  entityType?: string;

  @ApiProperty({ description: 'User who performed the activity' })
  userId!: string;

  @ApiProperty({ description: 'User name' })
  userName!: string;

  @ApiProperty({ description: 'Priority level' })
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class KeyPerformanceIndicator {
  @ApiProperty({ description: 'KPI name' })
  name!: string;

  @ApiProperty({ description: 'Current value' })
  value!: number;

  @ApiProperty({ description: 'Target value' })
  target!: number;

  @ApiProperty({ description: 'Unit of measurement' })
  unit!: string;

  @ApiProperty({ description: 'Trend direction' })
  trend!: 'up' | 'down' | 'stable';

  @ApiProperty({ description: 'Change percentage' })
  changePercentage!: number;

  @ApiProperty({ description: 'Status indicator' })
  status!: 'good' | 'warning' | 'critical';

  @ApiProperty({ description: 'Description' })
  description?: string;
}

export class DashboardAlert {
  @ApiProperty({ description: 'Alert ID' })
  id!: string;

  @ApiProperty({ description: 'Alert type' })
  type!: 'deadline' | 'task' | 'billing' | 'compliance' | 'system';

  @ApiProperty({ description: 'Severity level' })
  severity!: 'info' | 'warning' | 'error' | 'critical';

  @ApiProperty({ description: 'Alert title' })
  title!: string;

  @ApiProperty({ description: 'Alert message' })
  message!: string;

  @ApiProperty({ description: 'Related entity ID' })
  entityId?: string;

  @ApiProperty({ description: 'Action required' })
  actionRequired!: boolean;

  @ApiProperty({ description: 'Timestamp' })
  timestamp!: Date;

  @ApiProperty({ description: 'Is read' })
  isRead!: boolean;
}

// Now define the composite class that uses the above classes
export class DashboardDataDto {
  @ApiProperty({ description: 'Summary statistics', type: DashboardSummary })
  summary!: DashboardSummary;

  @ApiProperty({ description: 'Recent activity feed', type: [ActivityItem] })
  recentActivity!: ActivityItem[];

  @ApiProperty({ description: 'Key performance indicators', type: [KeyPerformanceIndicator] })
  kpis!: KeyPerformanceIndicator[];

  @ApiProperty({ description: 'Alerts and notifications', type: [DashboardAlert] })
  alerts!: DashboardAlert[];

  @ApiProperty({ description: 'Charts data', type: [DashboardChart] })
  charts!: DashboardChart[];

  @ApiProperty({ description: 'Quick stats', type: [QuickStat] })
  quickStats!: QuickStat[];
}

export class CaseSummary {
  @ApiProperty({ description: 'Case ID' })
  id!: string;

  @ApiProperty({ description: 'Case number' })
  caseNumber!: string;

  @ApiProperty({ description: 'Case title' })
  title!: string;

  @ApiProperty({ description: 'Client name' })
  clientName!: string;

  @ApiProperty({ description: 'Status' })
  status!: string;

  @ApiProperty({ description: 'Practice area' })
  practiceArea!: string;

  @ApiProperty({ description: 'Next deadline' })
  nextDeadline?: Date;

  @ApiProperty({ description: 'Days until deadline' })
  daysUntilDeadline?: number;

  @ApiProperty({ description: 'Pending tasks count' })
  pendingTasks!: number;

  @ApiProperty({ description: 'Last activity date' })
  lastActivity!: Date;
}

export class MyCasesSummaryDto {
  @ApiProperty({ description: 'Total assigned cases' })
  totalCases!: number;

  @ApiProperty({ description: 'Active cases' })
  activeCases!: number;

  @ApiProperty({ description: 'Cases by status' })
  casesByStatus!: { [status: string]: number };

  @ApiProperty({ description: 'Recent cases', type: [CaseSummary] })
  recentCases!: CaseSummary[];

  @ApiProperty({ description: 'Cases needing attention', type: [CaseSummary] })
  casesNeedingAttention!: CaseSummary[];

  @ApiProperty({ description: 'My billable hours' })
  myBillableHours!: number;

  @ApiProperty({ description: 'My utilization rate' })
  myUtilizationRate!: number;
}

export class DeadlineItem {
  @ApiProperty({ description: 'Deadline ID' })
  id!: string;

  @ApiProperty({ description: 'Deadline title' })
  title!: string;

  @ApiProperty({ description: 'Due date' })
  dueDate!: Date;

  @ApiProperty({ description: 'Days until due' })
  daysUntil!: number;

  @ApiProperty({ description: 'Is overdue' })
  isOverdue!: boolean;

  @ApiProperty({ description: 'Priority level' })
  priority!: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Case ID' })
  caseId!: string;

  @ApiProperty({ description: 'Case number' })
  caseNumber!: string;

  @ApiProperty({ description: 'Deadline type' })
  type!: 'filing' | 'hearing' | 'discovery' | 'payment' | 'other';

  @ApiProperty({ description: 'Status' })
  status!: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

export class UpcomingDeadlinesDto {
  @ApiProperty({ description: 'Deadlines list', type: [DeadlineItem] })
  deadlines!: DeadlineItem[];

  @ApiProperty({ description: 'Total deadlines count' })
  totalCount!: number;

  @ApiProperty({ description: 'Overdue count' })
  overdueCount!: number;

  @ApiProperty({ description: 'This week count' })
  thisWeekCount!: number;

  @ApiProperty({ description: 'Next 30 days count' })
  next30DaysCount!: number;
}

export class TaskItem {
  @ApiProperty({ description: 'Task ID' })
  id!: string;

  @ApiProperty({ description: 'Task title' })
  title!: string;

  @ApiProperty({ description: 'Task description' })
  description?: string;

  @ApiProperty({ description: 'Due date' })
  dueDate?: Date;

  @ApiProperty({ description: 'Priority level' })
  priority!: 'low' | 'medium' | 'high' | 'urgent';

  @ApiProperty({ description: 'Status' })
  status!: 'pending' | 'in-progress' | 'completed';

  @ApiProperty({ description: 'Case ID' })
  caseId?: string;

  @ApiProperty({ description: 'Case number' })
  caseNumber?: string;

  @ApiProperty({ description: 'Assigned to user ID' })
  assignedToId!: string;

  @ApiProperty({ description: 'Assigned to user name' })
  assignedToName!: string;

  @ApiProperty({ description: 'Created date' })
  createdAt!: Date;
}

export class PendingTasksDto {
  @ApiProperty({ description: 'Tasks list', type: [TaskItem] })
  tasks!: TaskItem[];

  @ApiProperty({ description: 'Total tasks count' })
  totalCount!: number;

  @ApiProperty({ description: 'High priority count' })
  highPriorityCount!: number;

  @ApiProperty({ description: 'Overdue count' })
  overdueCount!: number;
}

export class InvoiceSummary {
  @ApiProperty({ description: 'Invoice ID' })
  id!: string;

  @ApiProperty({ description: 'Invoice number' })
  invoiceNumber!: string;

  @ApiProperty({ description: 'Client name' })
  clientName!: string;

  @ApiProperty({ description: 'Invoice amount' })
  amount!: number;

  @ApiProperty({ description: 'Amount paid' })
  amountPaid!: number;

  @ApiProperty({ description: 'Amount due' })
  amountDue!: number;

  @ApiProperty({ description: 'Invoice date' })
  invoiceDate!: Date;

  @ApiProperty({ description: 'Due date' })
  dueDate!: Date;

  @ApiProperty({ description: 'Status' })
  status!: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void';
}

export class BillingSummaryDto {
  @ApiProperty({ description: 'Current month revenue' })
  currentMonthRevenue!: number;

  @ApiProperty({ description: 'Last month revenue' })
  lastMonthRevenue!: number;

  @ApiProperty({ description: 'Revenue change percentage' })
  revenueChange!: number;

  @ApiProperty({ description: 'Unbilled hours' })
  unbilledHours!: number;

  @ApiProperty({ description: 'Unbilled value' })
  unbilledValue!: number;

  @ApiProperty({ description: 'Outstanding invoices' })
  outstandingInvoices!: number;

  @ApiProperty({ description: 'Outstanding amount' })
  outstandingAmount!: number;

  @ApiProperty({ description: 'Collection rate' })
  collectionRate!: number;

  @ApiProperty({ description: 'Recent invoices', type: [InvoiceSummary] })
  recentInvoices!: InvoiceSummary[];
}
