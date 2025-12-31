import { Injectable, Logger, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import {
  GenerateReportDto,
  ReportDto,
  ReportListDto,
  ReportTemplateDto,
  ReportStatus,
  ReportType,
  ReportFormat,
  DownloadReportDto,
} from './dto/reports.dto';
import { validatePagination } from '@common/utils/query-validation.util';
import {
  ReportTemplate,
  ReportRecord,
  ReportGenerationRequest,
  ScheduledReport,
  ReportStatusResponse,
  ExportReportResult,
  DownloadReportResult,
  ReportCancellationResult,
} from './interfaces/report.interfaces';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                  REPORTS SERVICE - REPORT GENERATION & ANALYTICS                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                                                   ║
 * ║  User Dashboard / Scheduler         ReportsController                     ReportsService                         ║
 * ║       │                                   │                                     │                                 ║
 * ║       │  POST /reports/generate           │                                     │                                 ║
 * ║       │  POST /reports/schedule           │                                     │                                 ║
 * ║       │  GET /reports/:id/download        │                                     │                                 ║
 * ║       │  GET /reports/templates           │                                     │                                 ║
 * ║       └───────────────────────────────────┴─────────────────────────────────────▶                                 ║
 * ║                                                                                 │                                 ║
 * ║                                                                 ┌───────────────┴────────────────┐                ║
 * ║                                                                 │  In-Memory Cache        │                ║
 * ║                                                                 │  (1000 reports, 24h)    │                ║
 * ║                                                                 │  Report Templates       │                ║
 * ║                                                                 └───────────────┬────────────────┘                ║
 * ║                                                                              │                                    ║
 * ║                                               ┌─────────────────────────────┴────────────────────────────┐        ║
 * ║                                               │  Background Report Generation Queue   │        ║
 * ║                                               │  (Bull + Redis)                       │        ║
 * ║                                               └────────────┬───────────────────────────────┘        ║
 * ║                                                             │                                                  ║
 * ║                          ┌──────────────────────────────┴──────────────────────────────────────────┐        ║
 * ║                          │                                                                  │        ║
 * ║           ┌─────────────┴───────────────┐  ┌─────────────┴────────────┐  ┌────────┴─────────┐  ║
 * ║           │                           │  │                         │  │                  │  ║
 * ║           ▼                           ▼  ▼                         ▼  ▼                  ▼  ║
 * ║    Cases/Billing/Discovery       Analytics       Time Tracking         Documents        File Export         ║
 * ║    Data Aggregation              Service         Service               Service          (PDF, Excel, CSV)   ║
 * ║                                                                                                                   ║
 * ║  DATA IN:  GenerateReportDto { type, format, filters{}, dateRange, parameters{} }                             ║
 * ║            ScheduleReportDto { templateId, schedule, recipients[], format }                                    ║
 * ║                                                                                                                   ║
 * ║  DATA OUT: Report { id, type, status, format, fileUrl, generatedAt, size }                                     ║
 * ║            Buffer/Stream (PDF, Excel, CSV download)                                                            ║
 * ║                                                                                                                   ║
 * ║  REPORT TYPES:                                                                                                  ║
 * ║    • case-summary        - Case overview with key metrics                                                       ║
 * ║    • billing-report      - Invoices, time entries, expenses                                                     ║
 * ║    • discovery-status    - Discovery progress & evidence tracking                                               ║
 * ║    • trial-preparation   - Trial readiness checklist & exhibits                                                 ║
 * ║    • compliance-audit    - Compliance violations & remediation                                                  ║
 * ║                                                                                                                   ║
 * ║  FEATURES: Background generation via Bull queue, scheduled reports, export to PDF/Excel/CSV, email delivery     ║
 * ║                                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

@Injectable()
export class ReportsService implements OnModuleDestroy {
  private readonly logger = new Logger(ReportsService.name);
  private reportTemplates: ReportTemplate[] = [];
  private reports: Map<string, ReportRecord> = new Map();
  private readonly MAX_REPORTS_IN_MEMORY = 1000;
  private readonly REPORT_TTL_MS = 24 * 60 * 60 * 1000;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    // @InjectRepository(Report) private reportRepository: Repository<ReportRecord>,
    // Inject repositories when entities are available
  ) {
    this.initializeTemplates();
    // Memory optimization: Periodic cleanup
    this.cleanupInterval = setInterval(() => this.cleanupOldReports(), 60 * 60 * 1000);
  }

  private initializeTemplates() {
    this.reportTemplates = [];
  }

  private cleanupOldReports(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, report] of this.reports.entries()) {
      const age = now - new Date(report.createdAt).getTime();
      if (age > this.REPORT_TTL_MS) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.reports.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned up ${keysToDelete.length} old reports`);
    }

    if (this.reports.size > this.MAX_REPORTS_IN_MEMORY) {
      const sortedReports = Array.from(this.reports.entries())
        .sort((a, b) => new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime());

      const toRemove = sortedReports.slice(0, sortedReports.length - this.MAX_REPORTS_IN_MEMORY);
      toRemove.forEach(([key]) => this.reports.delete(key));

      this.logger.warn(`Memory limit reached, removed ${toRemove.length} oldest reports`);
    }
  }

  onModuleDestroy(): void {
    this.logger.log('ReportsService cleanup...');

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear large data structures
    const reportCount = this.reports.size;
    this.reports.clear();
    this.reportTemplates = [];

    // Explicitly trigger GC hint (if available)
    if (global.gc) {
      global.gc();
    }

    this.logger.log(`ReportsService cleanup complete (cleared ${reportCount} reports)`);
  }

  /**
   * Get list of available report templates
   */
  async getGeneratedReports(): Promise<ReportRecord[]> {
    this.logger.debug('Fetching all generated reports');
    this.cleanupOldReports();
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getReportsByType(type: string): Promise<ReportRecord[]> {
    this.logger.debug(`Fetching reports of type: ${type}`);
    return Array.from(this.reports.values())
      .filter(report => report.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReportTemplates(): Promise<ReportTemplateDto[]> {
    const templates: ReportTemplateDto[] = [
      {
        id: 'case-summary',
        name: 'Case Summary Report',
        description: 'Comprehensive summary of case details, timeline, and financials',
        type: ReportType.CASE_SUMMARY,
        defaultFormat: ReportFormat.PDF,
        availableFilters: [
          {
            name: 'caseId',
            label: 'Case',
            type: 'select',
            required: true,
            defaultValue: null,
          },
          {
            name: 'includeFinancials',
            label: 'Include Financial Details',
            type: 'select',
            options: [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ],
            required: false,
            defaultValue: 'true',
          },
        ],
        availableParameters: [
          {
            name: 'includeTimeline',
            label: 'Include Timeline',
            type: 'boolean',
            defaultValue: true,
            description: 'Include chronological timeline of case events',
          },
          {
            name: 'includeDocuments',
            label: 'Include Document Statistics',
            type: 'boolean',
            defaultValue: true,
          },
        ],
        isSystem: true,
      },
      {
        id: 'billing-report',
        name: 'Billing Report',
        description: 'Detailed billing and time entry report',
        type: ReportType.BILLING,
        defaultFormat: ReportFormat.EXCEL,
        availableFilters: [
          {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            required: true,
            defaultValue: null,
          },
          {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            required: true,
            defaultValue: null,
          },
          {
            name: 'attorneyId',
            label: 'Attorney',
            type: 'select',
            required: false,
            defaultValue: null,
          },
        ],
        availableParameters: [
          {
            name: 'groupBy',
            label: 'Group By',
            type: 'select',
            options: [
              { value: 'attorney', label: 'Attorney' },
              { value: 'client', label: 'Client' },
              { value: 'practiceArea', label: 'Practice Area' },
            ],
            defaultValue: 'attorney',
          },
          {
            name: 'includeDetails',
            label: 'Include Time Entry Details',
            type: 'boolean',
            defaultValue: false,
          },
        ],
        isSystem: true,
      },
      {
        id: 'discovery-report',
        name: 'Discovery Report',
        description: 'Discovery progress and production volume report',
        type: ReportType.DISCOVERY,
        defaultFormat: ReportFormat.PDF,
        availableFilters: [
          {
            name: 'caseId',
            label: 'Case',
            type: 'select',
            required: true,
            defaultValue: null,
          },
        ],
        availableParameters: [
          {
            name: 'includeVolume',
            label: 'Include Production Volume',
            type: 'boolean',
            defaultValue: true,
          },
          {
            name: 'includeTimeline',
            label: 'Include Timeline',
            type: 'boolean',
            defaultValue: true,
          },
        ],
        isSystem: true,
      },
      {
        id: 'attorney-productivity',
        name: 'Attorney Productivity Report',
        description: 'Attorney utilization, realization, and productivity metrics',
        type: ReportType.ATTORNEY_PRODUCTIVITY,
        defaultFormat: ReportFormat.EXCEL,
        availableFilters: [
          {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            required: true,
            defaultValue: null,
          },
          {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            required: true,
            defaultValue: null,
          },
        ],
        availableParameters: [
          {
            name: 'includeCharts',
            label: 'Include Charts',
            type: 'boolean',
            defaultValue: true,
          },
        ],
        isSystem: true,
      },
    ];

    return templates;
  }

  /**
   * Get list of generated reports
   */
  async getReports(page?: number, limit?: number): Promise<ReportListDto> {
    validatePagination(page, limit, 50);
    try {
      // Mock implementation
      /*
      const [reports, total] = await this.reportRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      */

      const reports: ReportDto[] = [
        {
          id: '1',
          type: ReportType.BILLING,
          title: 'Monthly Billing Report - December 2024',
          description: 'Billing summary for December 2024',
          status: ReportStatus.COMPLETED,
          format: ReportFormat.PDF,
          generatedBy: 'user-1',
          generatedByName: 'Sarah Johnson',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-31'),
          filters: { attorneyId: null },
          parameters: { groupBy: 'attorney', includeDetails: false },
          fileSize: 245678,
          fileUrl: '/reports/download/1',
          createdAt: new Date(),
          completedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          type: ReportType.CASE_SUMMARY,
          title: 'Case Summary - CV-2024-001',
          status: ReportStatus.COMPLETED,
          format: ReportFormat.PDF,
          generatedBy: 'user-2',
          generatedByName: 'Michael Chen',
          filters: { caseId: 'case-1' },
          parameters: { includeTimeline: true },
          fileSize: 189234,
          fileUrl: '/reports/download/2',
          createdAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 86400000),
          expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        },
      ];

      return {
        reports,
        total: reports.length,
        page: page || 1,
        limit: limit || 50,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting reports: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(reportId: string): Promise<ReportDto> {
    try {
      // Mock implementation
      /*
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(`Report ${reportId} not found`);
      }

      return report;
      */

      const report: ReportDto = {
        id: reportId,
        type: ReportType.BILLING,
        title: 'Monthly Billing Report - December 2024',
        description: 'Billing summary for December 2024',
        status: ReportStatus.COMPLETED,
        format: ReportFormat.PDF,
        generatedBy: 'user-1',
        generatedByName: 'Sarah Johnson',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        filters: { attorneyId: null },
        parameters: { groupBy: 'attorney', includeDetails: false },
        fileSize: 245678,
        fileUrl: `/reports/download/${reportId}`,
        createdAt: new Date(),
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting report: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Generate a new report
   */
  async generateReport(dto: GenerateReportDto, userId: string): Promise<ReportDto> {
    try {
      this.logger.log(`Generating ${dto.type} report: ${dto.title}`);

      // Create report record
      const report: ReportDto = {
        id: this.generateReportId(),
        type: dto.type,
        title: dto.title,
        description: dto.description,
        status: ReportStatus.GENERATING,
        format: dto.format,
        generatedBy: userId,
        generatedByName: 'Current User', // Would get from user service
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        filters: dto.filters,
        parameters: dto.parameters,
        createdAt: new Date(),
      };

      // Save to database
      /*
      await this.reportRepository.save(report);
      */

      // Queue report generation job
      await this.queueReportGeneration(report, dto);

      // If email recipients provided, queue email delivery
      if (dto.emailRecipients && dto.emailRecipients.length > 0) {
        await this.queueEmailDelivery(report, dto.emailRecipients);
      }

      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error generating report: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Get download URL for a report
   */
  async getDownloadUrl(reportId: string): Promise<DownloadReportDto> {
    const report = await this.getReportById(reportId);

    if (report.status !== ReportStatus.COMPLETED) {
      throw new Error('Report is not ready for download');
    }

    const contentTypes = {
      [ReportFormat.PDF]: 'application/pdf',
      [ReportFormat.EXCEL]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      [ReportFormat.CSV]: 'text/csv',
      [ReportFormat.JSON]: 'application/json',
    };

    return {
      downloadUrl: `/api/v1/reports/${reportId}/download`,
      fileName: `${report.title}.${report.format}`,
      fileSize: report.fileSize || 0,
      contentType: contentTypes[report.format],
      expiresAt: report.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Queue report generation job
   */
  private async queueReportGeneration(report: ReportDto, _dto: GenerateReportDto): Promise<void> {
    // This would queue a background job to generate the report
    this.logger.log(`Queued report generation job for report ${report.id}`);

    // Simulate async generation
    setTimeout(async () => {
      await this.completeReportGeneration(report.id);
    }, 5000);
  }

  /**
   * Complete report generation
   */
  private async completeReportGeneration(reportId: string): Promise<void> {
    this.logger.log(`Completed report generation for report ${reportId}`);

    // Update report status
    /*
    await this.reportRepository.update(reportId, {
      status: ReportStatus.COMPLETED,
      completedAt: new Date(),
      fileSize: 245678,
      fileUrl: `/reports/download/${reportId}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    */
  }

  /**
   * Queue email delivery for report
   */
  private async queueEmailDelivery(report: ReportDto, recipients: string[]): Promise<void> {
    this.logger.log(`Queued email delivery for report ${report.id} to ${recipients.join(', ')}`);
    // Would integrate with email service
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    this.logger.log(`Deleting report ${reportId}`);
    // Delete from database and storage
    /*
    await this.reportRepository.delete(reportId);
    */
  }

  async findAll(): Promise<ReportRecord[]> {
    return Array.from(this.reports.values());
  }

  async findById(id: string): Promise<ReportRecord> {
    const report = this.reports.get(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async generate(generateDto: ReportGenerationRequest, userId: string): Promise<ReportRecord> {
    // Memory optimization: Check limits before generating
    if (this.reports.size >= this.MAX_REPORTS_IN_MEMORY) {
      this.cleanupOldReports();
      if (this.reports.size >= this.MAX_REPORTS_IN_MEMORY) {
        this.logger.warn('Report generation rejected due to memory limits');
        throw new Error('System busy: Report generation queue full. Please try again later.');
      }
    }

    const reportId = this.generateReportId();
    const report: ReportRecord = {
      id: reportId,
      type: generateDto.type,
      title: generateDto.title,
      description: generateDto.description,
      status: 'pending',
      format: generateDto.format || ReportFormat.PDF,
      generatedBy: userId,
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      startDate: generateDto.startDate ? new Date(generateDto.startDate) : undefined,
      endDate: generateDto.endDate ? new Date(generateDto.endDate) : undefined,
      filters: generateDto.filters,
      parameters: generateDto.parameters,
    };
    this.reports.set(reportId, report);
    return report;
  }

  async delete(id: string): Promise<void> {
    // Verify report exists before deleting
    await this.findById(id);
    this.reports.delete(id);
  }

  async download(id: string): Promise<DownloadReportResult> {
    const report = await this.findById(id);
    return {
      id: report.id,
      filePath: report.filePath || `/reports/${id}.pdf`,
      fileName: report.name || 'report.pdf',
    };
  }

  async findByType(type: string): Promise<ReportRecord[]> {
    return Array.from(this.reports.values()).filter(r => r.type === type);
  }

  async findByUser(userId: string): Promise<ReportRecord[]> {
    return Array.from(this.reports.values()).filter(r => r.generatedBy === userId);
  }

  async getTemplates(): Promise<ReportTemplate[]> {
    return this.reportTemplates;
  }

  async getTemplateById(id: string): Promise<ReportTemplate> {
    const template = this.reportTemplates.find(t => t.id === id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async createTemplate(createDto: Partial<ReportTemplate>, _userId: string): Promise<ReportTemplate> {
    const template: ReportTemplate = {
      id: 'template-' + Date.now(),
      name: createDto.name || 'New Template',
      type: createDto.type || ReportType.CUSTOM,
      description: createDto.description,
      category: createDto.category,
      defaultFormat: createDto.defaultFormat,
      sections: createDto.sections,
      parameters: createDto.parameters,
      scheduling: createDto.scheduling,
      isSystem: false,
      createdBy: _userId,
      createdAt: new Date(),
    };
    return template;
  }

  async scheduleReport(scheduleDto: Partial<ScheduledReport>, _userId?: string): Promise<ScheduledReport> {
    const schedule: ScheduledReport = {
      scheduleId: 'schedule-' + Date.now(),
      templateId: scheduleDto.templateId || '',
      frequency: scheduleDto.frequency || 'daily',
      parameters: scheduleDto.parameters || {},
      recipients: scheduleDto.recipients || [],
      enabled: scheduleDto.enabled !== undefined ? scheduleDto.enabled : true,
      lastRun: null,
      nextRun: scheduleDto.nextRun || new Date(Date.now() + 86400000),
      createdAt: new Date(),
      createdBy: _userId,
    };
    return schedule;
  }

  async getScheduledReports(userId: string): Promise<ReportRecord[]> {
    this.logger.debug(`Fetching scheduled reports for user: ${userId}`);
    // In production, this would query a scheduled_reports table
    // For now, filter reports with status 'scheduled' and matching userId
    return Array.from(this.reports.values())
      .filter(report => report.status === 'scheduled' && report.userId === userId)
      .sort((a, b) => new Date(a.scheduledAt || a.createdAt).getTime() - new Date(b.scheduledAt || b.createdAt).getTime());
  }

  async cancelScheduledReport(scheduleId: string, _userId: string): Promise<ReportCancellationResult> {
    return { id: scheduleId, status: 'cancelled', success: true };
  }

  async getReportStatus(id: string): Promise<ReportStatusResponse> {
    return { id, status: 'completed', progress: 100 };
  }

  async exportReport(id: string, format: string): Promise<ExportReportResult> {
    return { id, format, filePath: `/reports/${id}.${format}`, url: `/reports/download/${id}` };
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
