import { Injectable, Logger } from '@nestjs/common';
import { AuditTrailService, AuditEntry } from './audit-trail.service';
import { SearchQuery, AuditSearchService } from './audit-search.service';

export enum ExportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  PDF = 'PDF',
  XLSX = 'XLSX',
  XML = 'XML',
}

export interface ExportJob {
  id: string;
  format: ExportFormat;
  query: SearchQuery;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalRecords: number;
  processedRecords: number;
  downloadUrl?: string;
  expiresAt?: Date;
  error?: string;
  fileSize?: number;
}

@Injectable()
export class AuditExportService {
  private readonly logger = new Logger(AuditExportService.name);
  private exportJobs: Map<string, ExportJob> = new Map();

  constructor(
    private readonly auditTrailService: AuditTrailService,
    private readonly auditSearchService: AuditSearchService,
  ) {}

  /**
   * Create export job
   */
  async createExportJob(
    format: ExportFormat,
    query: SearchQuery,
    createdBy: string,
  ): Promise<ExportJob> {
    const job: ExportJob = {
      id: `export-${Date.now()}`,
      format,
      query,
      status: 'PENDING',
      createdBy,
      createdAt: new Date(),
      totalRecords: 0,
      processedRecords: 0,
    };

    this.exportJobs.set(job.id, job);
    this.logger.log(`Created export job ${job.id} in ${format} format for ${createdBy}`);

    // Start processing asynchronously
    this.processExportJob(job.id);

    return job;
  }

  /**
   * Process export job
   */
  private async processExportJob(jobId: string): Promise<void> {
    const job = this.exportJobs.get(jobId);
    if (!job) {
      return;
    }

    try {
      job.status = 'PROCESSING';
      job.startedAt = new Date();
      this.exportJobs.set(jobId, job);

      // Get data to export
      const searchResult = await this.auditSearchService.search({
        ...job.query,
        limit: 100000, // Large limit for export
      });

      job.totalRecords = searchResult.total;
      job.processedRecords = searchResult.entries.length;

      // Generate export based on format
      let exportData: string;
      let fileExtension: string;

      switch (job.format) {
        case ExportFormat.CSV:
          exportData = this.generateCSV(searchResult.entries);
          fileExtension = 'csv';
          break;

        case ExportFormat.JSON:
          exportData = this.generateJSON(searchResult.entries);
          fileExtension = 'json';
          break;

        case ExportFormat.PDF:
          exportData = this.generatePDF(searchResult.entries);
          fileExtension = 'pdf';
          break;

        case ExportFormat.XLSX:
          exportData = this.generateXLSX(searchResult.entries);
          fileExtension = 'xlsx';
          break;

        case ExportFormat.XML:
          exportData = this.generateXML(searchResult.entries);
          fileExtension = 'xml';
          break;

        default:
          throw new Error(`Unsupported export format: ${job.format}`);
      }

      // In production, save to file storage (S3, etc.)
      const filename = `audit-export-${jobId}.${fileExtension}`;
      job.downloadUrl = `/api/audit/exports/${jobId}/download`;
      job.fileSize = Buffer.byteLength(exportData, 'utf8');
      job.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      job.status = 'COMPLETED';
      job.completedAt = new Date();

      this.exportJobs.set(jobId, job);

      this.logger.log(
        `Export job ${jobId} completed: ${job.processedRecords} records, ${this.formatBytes(job.fileSize)}`,
      );
    } catch (error) {
      job.status = 'FAILED';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      this.exportJobs.set(jobId, job);

      this.logger.error(`Export job ${jobId} failed:`, error);
    }
  }

  /**
   * Generate CSV export
   */
  private generateCSV(entries: AuditEntry[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Sequence',
      'User ID',
      'User Name',
      'User Email',
      'Role',
      'Action',
      'Category',
      'Severity',
      'Resource Type',
      'Resource ID',
      'Resource Name',
      'Description',
      'IP Address',
      'Session ID',
      'Organization ID',
      'Successful',
      'Error Message',
    ];

    const rows = entries.map(entry => [
      entry.id,
      entry.timestamp.toISOString(),
      entry.sequenceNumber,
      entry.userId,
      entry.userName,
      entry.userEmail,
      entry.userRole,
      entry.action,
      entry.category,
      entry.severity,
      entry.resourceType,
      entry.resourceId,
      entry.resourceName || '',
      this.escapeCSV(entry.description),
      entry.ipAddress,
      entry.sessionId,
      entry.organizationId,
      entry.successful ? 'Yes' : 'No',
      entry.errorMessage || '',
    ]);

    const csvLines = [
      headers.join(','),
      ...rows.map(row => row.map(cell => this.escapeCSV(String(cell))).join(',')),
    ];

    return csvLines.join('\n');
  }

  /**
   * Escape CSV field
   */
  private escapeCSV(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Generate JSON export
   */
  private generateJSON(entries: AuditEntry[]): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalRecords: entries.length,
        entries: entries.map(entry => ({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        })),
      },
      null,
      2,
    );
  }

  /**
   * Generate PDF export (simplified HTML-based representation)
   */
  private generatePDF(entries: AuditEntry[]): string {
    // In production, use a proper PDF library like PDFKit or Puppeteer
    // For now, return HTML that can be converted to PDF

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Audit Log Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .metadata { background: #f5f5f5; padding: 10px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #4CAF50; color: white; padding: 8px; text-align: left; }
    td { border: 1px solid #ddd; padding: 8px; }
    tr:nth-child(even) { background: #f9f9f9; }
    .severity-critical { color: #d32f2f; font-weight: bold; }
    .severity-error { color: #f57c00; }
    .severity-warning { color: #fbc02d; }
  </style>
</head>
<body>
  <h1>Audit Log Export</h1>
  <div class="metadata">
    <p><strong>Export Date:</strong> ${new Date().toISOString()}</p>
    <p><strong>Total Records:</strong> ${entries.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>User</th>
        <th>Action</th>
        <th>Resource</th>
        <th>Description</th>
        <th>Severity</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${entries
        .map(
          entry => `
        <tr>
          <td>${entry.timestamp.toISOString()}</td>
          <td>${entry.userName}<br/><small>${entry.userEmail}</small></td>
          <td>${entry.action}</td>
          <td>${entry.resourceType}:${entry.resourceId}</td>
          <td>${entry.description}</td>
          <td class="severity-${entry.severity.toLowerCase()}">${entry.severity}</td>
          <td>${entry.successful ? '✓ Success' : '✗ Failed'}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

    return html;
  }

  /**
   * Generate XLSX export (simplified CSV-like format)
   */
  private generateXLSX(entries: AuditEntry[]): string {
    // In production, use a proper XLSX library like exceljs or xlsx
    // For now, return CSV format with .xlsx extension
    return this.generateCSV(entries);
  }

  /**
   * Generate XML export
   */
  private generateXML(entries: AuditEntry[]): string {
    const xmlEntries = entries
      .map(
        entry => `
  <entry>
    <id>${entry.id}</id>
    <timestamp>${entry.timestamp.toISOString()}</timestamp>
    <sequenceNumber>${entry.sequenceNumber}</sequenceNumber>
    <user>
      <userId>${entry.userId}</userId>
      <userName>${this.escapeXML(entry.userName)}</userName>
      <userEmail>${entry.userEmail}</userEmail>
      <userRole>${entry.userRole}</userRole>
    </user>
    <action>${entry.action}</action>
    <category>${entry.category}</category>
    <severity>${entry.severity}</severity>
    <resource>
      <type>${entry.resourceType}</type>
      <id>${entry.resourceId}</id>
      <name>${this.escapeXML(entry.resourceName || '')}</name>
    </resource>
    <description>${this.escapeXML(entry.description)}</description>
    <ipAddress>${entry.ipAddress}</ipAddress>
    <sessionId>${entry.sessionId}</sessionId>
    <organizationId>${entry.organizationId}</organizationId>
    <successful>${entry.successful}</successful>
    ${entry.errorMessage ? `<errorMessage>${this.escapeXML(entry.errorMessage)}</errorMessage>` : ''}
  </entry>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<auditLog exportDate="${new Date().toISOString()}" totalRecords="${entries.length}">
${xmlEntries}
</auditLog>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Format bytes to human-readable size
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get export job status
   */
  async getExportJob(jobId: string): Promise<ExportJob | null> {
    return this.exportJobs.get(jobId) || null;
  }

  /**
   * Get all export jobs for user
   */
  async getExportJobs(userId: string): Promise<ExportJob[]> {
    const jobs = Array.from(this.exportJobs.values());
    return jobs
      .filter(job => job.createdBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Cancel export job
   */
  async cancelExportJob(jobId: string): Promise<void> {
    const job = this.exportJobs.get(jobId);
    if (job && job.status === 'PENDING') {
      job.status = 'FAILED';
      job.error = 'Cancelled by user';
      job.completedAt = new Date();
      this.exportJobs.set(jobId, job);

      this.logger.log(`Export job ${jobId} cancelled`);
    }
  }

  /**
   * Delete expired export files
   */
  async cleanupExpiredExports(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, job] of this.exportJobs.entries()) {
      if (job.expiresAt && job.expiresAt < now) {
        this.exportJobs.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} expired export jobs`);
    }

    return deletedCount;
  }

  /**
   * Quick export to CSV
   */
  async exportToCSV(query: SearchQuery, createdBy: string): Promise<ExportJob> {
    return this.createExportJob(ExportFormat.CSV, query, createdBy);
  }

  /**
   * Quick export to JSON
   */
  async exportToJSON(query: SearchQuery, createdBy: string): Promise<ExportJob> {
    return this.createExportJob(ExportFormat.JSON, query, createdBy);
  }

  /**
   * Quick export to PDF
   */
  async exportToPDF(query: SearchQuery, createdBy: string): Promise<ExportJob> {
    return this.createExportJob(ExportFormat.PDF, query, createdBy);
  }

  /**
   * Export specific resource history
   */
  async exportResourceHistory(
    resourceType: string,
    resourceId: string,
    format: ExportFormat,
    createdBy: string,
  ): Promise<ExportJob> {
    const query: SearchQuery = {
      resourceType: [resourceType],
      resourceId: [resourceId],
      sortBy: 'timestamp',
      sortOrder: 'asc',
    };

    return this.createExportJob(format, query, createdBy);
  }

  /**
   * Export user activity
   */
  async exportUserActivity(
    userId: string,
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    createdBy: string,
  ): Promise<ExportJob> {
    const query: SearchQuery = {
      userId,
      startDate,
      endDate,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    };

    return this.createExportJob(format, query, createdBy);
  }
}
