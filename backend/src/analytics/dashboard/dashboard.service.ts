import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  DashboardQueryDto,
  DashboardDataDto,
  DashboardSummary,
  ActivityItem,
  KeyPerformanceIndicator,
  DashboardAlert,
  DashboardChart,
  QuickStat,
  MyCasesSummaryDto,
  CaseSummary,
  UpcomingDeadlinesDto,
  DeadlineItem,
  PendingTasksDto,
  TaskItem,
  BillingSummaryDto,
  InvoiceSummary,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    // @InjectRepository(Case) private caseRepository: Repository<any>,
    // @InjectRepository(Task) private taskRepository: Repository<any>,
    // Inject repositories when entities are available
  ) {}

  /**
   * Get complete dashboard data
   */
  async getDashboardData(query: DashboardQueryDto): Promise<DashboardDataDto> {
    try {
      const [summary, recentActivity, kpis, alerts, charts, quickStats] = await Promise.all([
        this.getDashboardSummary(query),
        this.getRecentActivity(query),
        this.getKPIs(query),
        this.getAlerts(query),
        this.getCharts(query),
        this.getQuickStats(query),
      ]);

      return {
        summary,
        recentActivity,
        kpis,
        alerts,
        charts,
        quickStats,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting dashboard data: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Get dashboard summary statistics
   */
  private async getDashboardSummary(query: DashboardQueryDto): Promise<DashboardSummary> {
    return {
      activeCases: 85,
      casesWon: 12,
      totalRevenue: 4980000,
      revenueChange: 8.5,
      billableHours: 12450,
      hoursChange: 6.2,
      activeClients: 67,
      pendingTasks: 45,
      upcomingDeadlines: 23,
      overdueItems: 5,
    };
  }

  /**
   * Get recent activity feed
   */
  private async getRecentActivity(query: DashboardQueryDto): Promise<ActivityItem[]> {
    return [
      {
        id: '1',
        type: 'motion',
        title: 'Motion to Dismiss Filed',
        description: 'Motion to dismiss filed in Case CV-2024-001',
        timestamp: new Date(),
        entityId: 'case-1',
        entityType: 'case',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        priority: 'high',
      },
      {
        id: '2',
        type: 'deadline',
        title: 'Discovery Deadline Approaching',
        description: 'Discovery cutoff in 7 days for Case CV-2024-002',
        timestamp: new Date(Date.now() - 3600000),
        entityId: 'case-2',
        entityType: 'case',
        userId: 'system',
        userName: 'System',
        priority: 'urgent',
      },
      {
        id: '3',
        type: 'document',
        title: 'New Document Uploaded',
        description: 'Contract agreement uploaded to Case CV-2024-003',
        timestamp: new Date(Date.now() - 7200000),
        entityId: 'doc-123',
        entityType: 'document',
        userId: 'user-2',
        userName: 'Michael Chen',
        priority: 'medium',
      },
    ];
  }

  /**
   * Get key performance indicators
   */
  private async getKPIs(query: DashboardQueryDto): Promise<KeyPerformanceIndicator[]> {
    return [
      {
        name: 'Realization Rate',
        value: 87.9,
        target: 90,
        unit: '%',
        trend: 'up',
        changePercentage: 2.3,
        status: 'good',
        description: 'Percentage of billed fees actually collected',
      },
      {
        name: 'Utilization Rate',
        value: 84.2,
        target: 85,
        unit: '%',
        trend: 'up',
        changePercentage: 1.5,
        status: 'good',
        description: 'Billable hours as percentage of available hours',
      },
      {
        name: 'Case Win Rate',
        value: 62.5,
        target: 65,
        unit: '%',
        trend: 'stable',
        changePercentage: 0.2,
        status: 'warning',
        description: 'Percentage of cases won',
      },
      {
        name: 'Days Sales Outstanding',
        value: 52,
        target: 45,
        unit: 'days',
        trend: 'down',
        changePercentage: -3.2,
        status: 'critical',
        description: 'Average days to collect payment',
      },
    ];
  }

  /**
   * Get dashboard alerts
   */
  private async getAlerts(query: DashboardQueryDto): Promise<DashboardAlert[]> {
    return [
      {
        id: '1',
        type: 'deadline',
        severity: 'critical',
        title: 'Critical Deadline Tomorrow',
        message: 'Filing deadline for Motion to Compel in Case CV-2024-001',
        entityId: 'case-1',
        actionRequired: true,
        timestamp: new Date(),
        isRead: false,
      },
      {
        id: '2',
        type: 'billing',
        severity: 'warning',
        title: 'Unbilled Time Accumulating',
        message: 'Over $125,000 in unbilled time entries pending',
        actionRequired: true,
        timestamp: new Date(),
        isRead: false,
      },
      {
        id: '3',
        type: 'compliance',
        severity: 'error',
        title: 'Conflict Check Required',
        message: 'New matter requires conflict check approval',
        entityId: 'case-5',
        actionRequired: true,
        timestamp: new Date(),
        isRead: false,
      },
    ];
  }

  /**
   * Get dashboard charts data
   */
  private async getCharts(query: DashboardQueryDto): Promise<DashboardChart[]> {
    return [
      {
        id: 'revenue-trend',
        title: 'Revenue Trend (Last 6 Months)',
        type: 'line',
        data: {
          labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Revenue',
              data: [420000, 465000, 498000, 512000, 485000, 498000],
              borderColor: '#3b82f6',
            },
          ],
        },
      },
      {
        id: 'cases-by-status',
        title: 'Cases by Status',
        type: 'doughnut',
        data: {
          labels: ['Active', 'Closed', 'Pending', 'Archived'],
          datasets: [
            {
              label: 'Cases',
              data: [85, 65, 10, 5],
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'],
            },
          ],
        },
      },
    ];
  }

  /**
   * Get quick statistics
   */
  private async getQuickStats(query: DashboardQueryDto): Promise<QuickStat[]> {
    return [
      {
        label: 'Active Cases',
        value: 85,
        icon: 'briefcase',
        color: 'blue',
        link: '/cases',
      },
      {
        label: 'Pending Tasks',
        value: 45,
        icon: 'check-square',
        color: 'orange',
        link: '/tasks',
      },
      {
        label: 'This Month Revenue',
        value: '$498,000',
        icon: 'dollar-sign',
        color: 'green',
        link: '/billing',
      },
      {
        label: 'Active Clients',
        value: 67,
        icon: 'users',
        color: 'purple',
        link: '/clients',
      },
    ];
  }

  /**
   * Get user's cases summary
   */
  async getMyCasesSummary(userId: string): Promise<MyCasesSummaryDto> {
    try {
      const recentCases: CaseSummary[] = [
        {
          id: '1',
          caseNumber: 'CV-2024-001',
          title: 'Contract Dispute - Acme Corp',
          clientName: 'Acme Corporation',
          status: 'active',
          practiceArea: 'Corporate Law',
          nextDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          daysUntilDeadline: 7,
          pendingTasks: 5,
          lastActivity: new Date(),
        },
        {
          id: '2',
          caseNumber: 'CV-2024-002',
          title: 'Employment Litigation',
          clientName: 'Tech Innovations Inc',
          status: 'active',
          practiceArea: 'Employment Law',
          nextDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          daysUntilDeadline: 14,
          pendingTasks: 3,
          lastActivity: new Date(Date.now() - 86400000),
        },
      ];

      return {
        totalCases: 28,
        activeCases: 18,
        casesByStatus: {
          active: 18,
          closed: 8,
          pending: 2,
        },
        recentCases,
        casesNeedingAttention: recentCases.filter(c => c.daysUntilDeadline! < 10),
        myBillableHours: 1850,
        myUtilizationRate: 88,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting my cases summary: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(userId?: string): Promise<UpcomingDeadlinesDto> {
    try {
      const deadlines: DeadlineItem[] = [
        {
          id: '1',
          title: 'File Motion to Compel',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          daysUntil: 1,
          isOverdue: false,
          priority: 'critical',
          caseId: 'case-1',
          caseNumber: 'CV-2024-001',
          type: 'filing',
          status: 'pending',
        },
        {
          id: '2',
          title: 'Discovery Cutoff',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          daysUntil: 7,
          isOverdue: false,
          priority: 'high',
          caseId: 'case-2',
          caseNumber: 'CV-2024-002',
          type: 'discovery',
          status: 'in-progress',
        },
        {
          id: '3',
          title: 'Summary Judgment Hearing',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          daysUntil: 14,
          isOverdue: false,
          priority: 'high',
          caseId: 'case-3',
          caseNumber: 'CV-2024-003',
          type: 'hearing',
          status: 'pending',
        },
      ];

      return {
        deadlines,
        totalCount: deadlines.length,
        overdueCount: deadlines.filter(d => d.isOverdue).length,
        thisWeekCount: deadlines.filter(d => d.daysUntil <= 7).length,
        next30DaysCount: deadlines.filter(d => d.daysUntil <= 30).length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting upcoming deadlines: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Get pending tasks
   */
  async getPendingTasks(userId?: string): Promise<PendingTasksDto> {
    try {
      const tasks: TaskItem[] = [
        {
          id: '1',
          title: 'Review discovery responses',
          description: 'Review and analyze discovery responses from opposing counsel',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'high',
          status: 'pending',
          caseId: 'case-1',
          caseNumber: 'CV-2024-001',
          assignedToId: 'user-1',
          assignedToName: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          id: '2',
          title: 'Prepare deposition outline',
          description: 'Draft outline for CEO deposition',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          priority: 'high',
          status: 'in-progress',
          caseId: 'case-2',
          caseNumber: 'CV-2024-002',
          assignedToId: 'user-1',
          assignedToName: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 2 * 86400000),
        },
      ];

      return {
        tasks,
        totalCount: tasks.length,
        highPriorityCount: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
        overdueCount: tasks.filter(t => t.dueDate && t.dueDate < new Date()).length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting pending tasks: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Get billing summary
   */
  async getBillingSummary(userId?: string): Promise<BillingSummaryDto> {
    try {
      const recentInvoices: InvoiceSummary[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-1234',
          clientName: 'Acme Corporation',
          amount: 45000,
          amountPaid: 45000,
          amountDue: 0,
          invoiceDate: new Date('2024-12-01'),
          dueDate: new Date('2024-12-31'),
          status: 'paid',
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-1235',
          clientName: 'Tech Innovations Inc',
          amount: 32500,
          amountPaid: 0,
          amountDue: 32500,
          invoiceDate: new Date('2024-12-05'),
          dueDate: new Date('2025-01-05'),
          status: 'sent',
        },
      ];

      return {
        currentMonthRevenue: 498000,
        lastMonthRevenue: 459000,
        revenueChange: 8.5,
        unbilledHours: 342,
        unbilledValue: 136800,
        outstandingInvoices: 15,
        outstandingAmount: 487500,
        collectionRate: 87.9,
        recentInvoices,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting billing summary: ${message}`, stack);
      throw error;
    }
  }
}
