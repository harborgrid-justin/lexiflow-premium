import { Injectable, Logger } from '@nestjs/common';
import { AuditTrailService, AuditAction, AuditCategory, AuditSeverity } from './audit-trail.service';

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
  HTML = 'HTML',
  EXCEL = 'EXCEL',
}

export enum ReportType {
  USER_ACTIVITY = 'USER_ACTIVITY',
  SECURITY_EVENTS = 'SECURITY_EVENTS',
  COMPLIANCE_AUDIT = 'COMPLIANCE_AUDIT',
  DATA_ACCESS = 'DATA_ACCESS',
  CHANGE_HISTORY = 'CHANGE_HISTORY',
  FAILED_ACCESS = 'FAILED_ACCESS',
  CRITICAL_EVENTS = 'CRITICAL_EVENTS',
  RESOURCE_ACCESS = 'RESOURCE_ACCESS',
  LOGIN_HISTORY = 'LOGIN_HISTORY',
  PERMISSION_CHANGES = 'PERMISSION_CHANGES',
}

export interface AuditReport {
  id: string;
  reportType: ReportType;
  title: string;
  description: string;
  generatedAt: Date;
  generatedBy: string;
  dateRange: { start: Date; end: Date };
  format: ReportFormat;
  filters: ReportFilters;
  summary: ReportSummary;
  sections: ReportSection[];
  downloadUrl: string;
  expiresAt: Date;
}

export interface ReportFilters {
  userId?: string;
  organizationId?: string;
  resourceType?: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
  includeSuccessful?: boolean;
  includeFailed?: boolean;
}

export interface ReportSummary {
  totalEvents: number;
  uniqueUsers: number;
  criticalEvents: number;
  securityIncidents: number;
  failedAttempts: number;
  topUsers: Array<{ userId: string; userName: string; eventCount: number }>;
  topResources: Array<{ resourceType: string; resourceId: string; accessCount: number }>;
  complianceScore: number;
  findings: string[];
  recommendations: string[];
}

export interface ReportSection {
  title: string;
  description: string;
  data: any;
  charts?: ChartData[];
}

export interface ChartData {
  type: 'LINE' | 'BAR' | 'PIE' | 'AREA';
  title: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
  }>;
}

@Injectable()
export class AuditReportService {
  private readonly logger = new Logger(AuditReportService.name);
  private reports: Map<string, AuditReport> = new Map();

  constructor(private readonly auditTrailService: AuditTrailService) {}

  /**
   * Generate comprehensive audit report
   */
  async generateReport(
    reportType: ReportType,
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    format: ReportFormat,
    filters?: ReportFilters,
  ): Promise<AuditReport> {
    const reportId = `report-${Date.now()}`;

    this.logger.log(`Generating ${reportType} report for ${generatedBy}`);

    let report: AuditReport;

    switch (reportType) {
      case ReportType.USER_ACTIVITY:
        report = await this.generateUserActivityReport(
          reportId,
          dateRange,
          generatedBy,
          format,
          filters,
        );
        break;

      case ReportType.SECURITY_EVENTS:
        report = await this.generateSecurityEventsReport(
          reportId,
          dateRange,
          generatedBy,
          format,
          filters,
        );
        break;

      case ReportType.COMPLIANCE_AUDIT:
        report = await this.generateComplianceAuditReport(
          reportId,
          dateRange,
          generatedBy,
          format,
          filters,
        );
        break;

      case ReportType.DATA_ACCESS:
        report = await this.generateDataAccessReport(
          reportId,
          dateRange,
          generatedBy,
          format,
          filters,
        );
        break;

      case ReportType.FAILED_ACCESS:
        report = await this.generateFailedAccessReport(
          reportId,
          dateRange,
          generatedBy,
          format,
          filters,
        );
        break;

      case ReportType.CRITICAL_EVENTS:
        report = await this.generateCriticalEventsReport(
          reportId,
          dateRange,
          generatedBy,
          format,
          filters,
        );
        break;

      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    this.reports.set(reportId, report);
    this.logger.log(`Generated report ${reportId}: ${report.title}`);

    return report;
  }

  /**
   * Generate user activity report
   */
  private async generateUserActivityReport(
    reportId: string,
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    format: ReportFormat,
    filters?: ReportFilters,
  ): Promise<AuditReport> {
    const stats = await this.auditTrailService.getAuditStatistics(dateRange.start, dateRange.end);

    const { entries } = await this.auditTrailService.getAuditEntries({
      startDate: dateRange.start,
      endDate: dateRange.end,
      organizationId: filters?.organizationId,
      userId: filters?.userId,
      limit: 10000,
    });

    // Calculate top users
    const userActivity = new Map<string, { userName: string; count: number }>();
    entries.forEach(entry => {
      const current = userActivity.get(entry.userId) || { userName: entry.userName, count: 0 };
      current.count++;
      userActivity.set(entry.userId, current);
    });

    const topUsers = Array.from(userActivity.entries())
      .map(([userId, data]) => ({ userId, userName: data.userName, eventCount: data.count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // Activity by hour
    const hourlyActivity = new Array(24).fill(0);
    entries.forEach(entry => {
      const hour = entry.timestamp.getHours();
      hourlyActivity[hour]++;
    });

    const summary: ReportSummary = {
      totalEvents: stats.totalEntries,
      uniqueUsers: stats.uniqueUsers,
      criticalEvents: stats.criticalEventsCount,
      securityIncidents: stats.securityEventsCount,
      failedAttempts: stats.totalEntries - Math.floor((stats.successRate / 100) * stats.totalEntries),
      topUsers,
      topResources: [],
      complianceScore: Math.round(stats.successRate),
      findings: [],
      recommendations: [],
    };

    // Add findings
    if (stats.successRate < 95) {
      summary.findings.push(`Low success rate: ${stats.successRate.toFixed(2)}%`);
    }
    if (stats.criticalEventsCount > 10) {
      summary.findings.push(`High number of critical events: ${stats.criticalEventsCount}`);
    }

    const sections: ReportSection[] = [
      {
        title: 'Activity Overview',
        description: 'Summary of user activity during the reporting period',
        data: stats,
        charts: [
          {
            type: 'BAR',
            title: 'Actions by Type',
            labels: Object.keys(stats.actionDistribution),
            datasets: [
              {
                label: 'Count',
                data: Object.values(stats.actionDistribution),
              },
            ],
          },
          {
            type: 'LINE',
            title: 'Activity by Hour of Day',
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            datasets: [
              {
                label: 'Events',
                data: hourlyActivity,
              },
            ],
          },
        ],
      },
      {
        title: 'Top Users',
        description: 'Users with the most activity',
        data: topUsers,
      },
    ];

    return {
      id: reportId,
      reportType: ReportType.USER_ACTIVITY,
      title: 'User Activity Report',
      description: `Comprehensive user activity analysis from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
      generatedAt: new Date(),
      generatedBy,
      dateRange,
      format,
      filters: filters || {},
      summary,
      sections,
      downloadUrl: `/api/audit/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  }

  /**
   * Generate security events report
   */
  private async generateSecurityEventsReport(
    reportId: string,
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    format: ReportFormat,
    filters?: ReportFilters,
  ): Promise<AuditReport> {
    const allSecurityEvents = await this.auditTrailService.getSecurityEvents(
      dateRange.start,
      dateRange.end,
    );

    const failedEvents = allSecurityEvents.filter(e => !e.successful);

    // Group by IP address
    const ipActivity = new Map<string, number>();
    failedEvents.forEach(event => {
      ipActivity.set(event.ipAddress, (ipActivity.get(event.ipAddress) || 0) + 1);
    });

    // Find suspicious IPs (more than 10 failed attempts)
    const suspiciousIPs = Array.from(ipActivity.entries())
      .filter(([_, count]) => count > 10)
      .map(([ip, count]) => ({ ip, failedAttempts: count }))
      .sort((a, b) => b.failedAttempts - a.failedAttempts);

    const summary: ReportSummary = {
      totalEvents: allSecurityEvents.length,
      uniqueUsers: new Set(allSecurityEvents.map(e => e.userId)).size,
      criticalEvents: allSecurityEvents.filter(e => e.severity === AuditSeverity.CRITICAL).length,
      securityIncidents: allSecurityEvents.length,
      failedAttempts: failedEvents.length,
      topUsers: [],
      topResources: [],
      complianceScore: 100 - Math.min(failedEvents.length, 100),
      findings: [],
      recommendations: [],
    };

    // Add findings
    if (suspiciousIPs.length > 0) {
      summary.findings.push(
        `${suspiciousIPs.length} suspicious IP addresses detected with multiple failed login attempts`,
      );
    }
    if (failedEvents.length > 100) {
      summary.findings.push(
        `High number of failed security events: ${failedEvents.length}`,
      );
    }

    // Add recommendations
    summary.recommendations.push('Review and investigate all failed authentication attempts');
    if (suspiciousIPs.length > 0) {
      summary.recommendations.push('Consider implementing IP-based rate limiting or blocking');
    }

    const sections: ReportSection[] = [
      {
        title: 'Security Events Summary',
        description: 'Overview of security-related events',
        data: {
          total: allSecurityEvents.length,
          successful: allSecurityEvents.filter(e => e.successful).length,
          failed: failedEvents.length,
        },
        charts: [
          {
            type: 'PIE',
            title: 'Event Status',
            labels: ['Successful', 'Failed'],
            datasets: [
              {
                label: 'Events',
                data: [
                  allSecurityEvents.filter(e => e.successful).length,
                  failedEvents.length,
                ],
                backgroundColor: ['#4CAF50', '#f44336'],
              },
            ],
          },
        ],
      },
      {
        title: 'Suspicious Activity',
        description: 'IP addresses with multiple failed attempts',
        data: suspiciousIPs,
      },
      {
        title: 'Recent Failed Events',
        description: 'Most recent failed security events',
        data: failedEvents.slice(0, 50),
      },
    ];

    return {
      id: reportId,
      reportType: ReportType.SECURITY_EVENTS,
      title: 'Security Events Report',
      description: `Security events analysis from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
      generatedAt: new Date(),
      generatedBy,
      dateRange,
      format,
      filters: filters || {},
      summary,
      sections,
      downloadUrl: `/api/audit/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Generate compliance audit report
   */
  private async generateComplianceAuditReport(
    reportId: string,
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    format: ReportFormat,
    filters?: ReportFilters,
  ): Promise<AuditReport> {
    const complianceEvents = await this.auditTrailService.getComplianceEvents(
      dateRange.start,
      dateRange.end,
    );

    const stats = await this.auditTrailService.getAuditStatistics(dateRange.start, dateRange.end);

    // Verify audit chain integrity
    const chainVerification = await this.auditTrailService.verifyAuditChain();

    const summary: ReportSummary = {
      totalEvents: stats.totalEntries,
      uniqueUsers: stats.uniqueUsers,
      criticalEvents: stats.criticalEventsCount,
      securityIncidents: stats.securityEventsCount,
      failedAttempts: stats.totalEntries - Math.floor((stats.successRate / 100) * stats.totalEntries),
      topUsers: [],
      topResources: [],
      complianceScore: chainVerification.isValid ? 100 : 0,
      findings: [],
      recommendations: [],
    };

    // Add findings
    if (!chainVerification.isValid) {
      summary.findings.push(
        `CRITICAL: Audit chain integrity violation at sequence ${chainVerification.brokenAtSequence}`,
      );
    }
    summary.findings.push(`Total audit entries: ${stats.totalEntries}`);
    summary.findings.push(`Audit success rate: ${stats.successRate.toFixed(2)}%`);

    // Add recommendations
    summary.recommendations.push('Maintain immutable audit logs for compliance');
    summary.recommendations.push('Regular audit log reviews should be conducted');
    summary.recommendations.push('Ensure all critical operations are logged');

    const sections: ReportSection[] = [
      {
        title: 'Audit Trail Integrity',
        description: 'Verification of audit log chain integrity',
        data: {
          isValid: chainVerification.isValid,
          totalEntries: chainVerification.totalEntries,
          brokenAtSequence: chainVerification.brokenAtSequence,
        },
      },
      {
        title: 'Compliance Events',
        description: 'Events related to compliance activities',
        data: complianceEvents.slice(0, 100),
      },
      {
        title: 'Statistics',
        description: 'Overall audit statistics',
        data: stats,
        charts: [
          {
            type: 'PIE',
            title: 'Events by Category',
            labels: Object.keys(stats.categoryDistribution),
            datasets: [
              {
                label: 'Count',
                data: Object.values(stats.categoryDistribution),
              },
            ],
          },
        ],
      },
    ];

    return {
      id: reportId,
      reportType: ReportType.COMPLIANCE_AUDIT,
      title: 'Compliance Audit Report',
      description: `Compliance audit for ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
      generatedAt: new Date(),
      generatedBy,
      dateRange,
      format,
      filters: filters || {},
      summary,
      sections,
      downloadUrl: `/api/audit/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for compliance
    };
  }

  /**
   * Generate data access report
   */
  private async generateDataAccessReport(
    reportId: string,
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    format: ReportFormat,
    filters?: ReportFilters,
  ): Promise<AuditReport> {
    const { entries } = await this.auditTrailService.getAuditEntries({
      startDate: dateRange.start,
      endDate: dateRange.end,
      category: AuditCategory.DATA_ACCESS,
      limit: 10000,
    });

    // Count access by resource
    const resourceAccess = new Map<string, number>();
    entries.forEach(entry => {
      const key = `${entry.resourceType}:${entry.resourceId}`;
      resourceAccess.set(key, (resourceAccess.get(key) || 0) + 1);
    });

    const topResources = Array.from(resourceAccess.entries())
      .map(([key, count]) => {
        const [resourceType, resourceId] = key.split(':');
        return { resourceType, resourceId, accessCount: count };
      })
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 20);

    const summary: ReportSummary = {
      totalEvents: entries.length,
      uniqueUsers: new Set(entries.map(e => e.userId)).size,
      criticalEvents: 0,
      securityIncidents: 0,
      failedAttempts: entries.filter(e => !e.successful).length,
      topUsers: [],
      topResources,
      complianceScore: 100,
      findings: [`Total data access events: ${entries.length}`],
      recommendations: ['Monitor unusual data access patterns', 'Review access to sensitive resources'],
    };

    const sections: ReportSection[] = [
      {
        title: 'Data Access Summary',
        description: 'Overview of data access activities',
        data: {
          totalAccess: entries.length,
          uniqueUsers: summary.uniqueUsers,
          uniqueResources: resourceAccess.size,
        },
      },
      {
        title: 'Most Accessed Resources',
        description: 'Resources with the highest access frequency',
        data: topResources,
      },
    ];

    return {
      id: reportId,
      reportType: ReportType.DATA_ACCESS,
      title: 'Data Access Report',
      description: `Data access analysis from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
      generatedAt: new Date(),
      generatedBy,
      dateRange,
      format,
      filters: filters || {},
      summary,
      sections,
      downloadUrl: `/api/audit/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Generate failed access report
   */
  private async generateFailedAccessReport(
    reportId: string,
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    format: ReportFormat,
    filters?: ReportFilters,
  ): Promise<AuditReport> {
    const { entries } = await this.auditTrailService.getAuditEntries({
      startDate: dateRange.start,
      endDate: dateRange.end,
      successful: false,
      limit: 10000,
    });

    const summary: ReportSummary = {
      totalEvents: entries.length,
      uniqueUsers: new Set(entries.map(e => e.userId)).size,
      criticalEvents: entries.filter(e => e.severity === AuditSeverity.CRITICAL).length,
      securityIncidents: entries.filter(e => e.category === AuditCategory.SECURITY).length,
      failedAttempts: entries.length,
      topUsers: [],
      topResources: [],
      complianceScore: 100 - Math.min(entries.length, 100),
      findings: [`Total failed access attempts: ${entries.length}`],
      recommendations: ['Investigate repeated failed access attempts', 'Review user permissions'],
    };

    const sections: ReportSection[] = [
      {
        title: 'Failed Access Summary',
        description: 'Overview of failed access attempts',
        data: {
          total: entries.length,
          uniqueUsers: summary.uniqueUsers,
          security: summary.securityIncidents,
        },
      },
      {
        title: 'Recent Failed Attempts',
        description: 'Most recent failed access attempts',
        data: entries.slice(0, 100),
      },
    ];

    return {
      id: reportId,
      reportType: ReportType.FAILED_ACCESS,
      title: 'Failed Access Report',
      description: `Failed access attempts from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
      generatedAt: new Date(),
      generatedBy,
      dateRange,
      format,
      filters: filters || {},
      summary,
      sections,
      downloadUrl: `/api/audit/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Generate critical events report
   */
  private async generateCriticalEventsReport(
    reportId: string,
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    format: ReportFormat,
    filters?: ReportFilters,
  ): Promise<AuditReport> {
    const { entries } = await this.auditTrailService.getAuditEntries({
      startDate: dateRange.start,
      endDate: dateRange.end,
      severity: AuditSeverity.CRITICAL,
      limit: 10000,
    });

    const summary: ReportSummary = {
      totalEvents: entries.length,
      uniqueUsers: new Set(entries.map(e => e.userId)).size,
      criticalEvents: entries.length,
      securityIncidents: entries.filter(e => e.category === AuditCategory.SECURITY).length,
      failedAttempts: entries.filter(e => !e.successful).length,
      topUsers: [],
      topResources: [],
      complianceScore: entries.length === 0 ? 100 : 50,
      findings: [`Critical events detected: ${entries.length}`],
      recommendations: ['Immediate review of all critical events required'],
    };

    const sections: ReportSection[] = [
      {
        title: 'Critical Events',
        description: 'All critical severity events',
        data: entries,
      },
    ];

    return {
      id: reportId,
      reportType: ReportType.CRITICAL_EVENTS,
      title: 'Critical Events Report',
      description: `Critical events from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
      generatedAt: new Date(),
      generatedBy,
      dateRange,
      format,
      filters: filters || {},
      summary,
      sections,
      downloadUrl: `/api/audit/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Get report by ID
   */
  async getReport(reportId: string): Promise<AuditReport | null> {
    return this.reports.get(reportId) || null;
  }

  /**
   * Get all reports
   */
  async getAllReports(): Promise<AuditReport[]> {
    return Array.from(this.reports.values()).sort(
      (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime(),
    );
  }

  /**
   * Delete expired reports
   */
  async cleanupExpiredReports(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, report] of this.reports.entries()) {
      if (report.expiresAt < now) {
        this.reports.delete(id);
        deletedCount++;
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} expired reports`);
    return deletedCount;
  }
}
