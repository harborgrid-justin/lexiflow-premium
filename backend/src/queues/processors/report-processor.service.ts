import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../queues.module';

export interface ReportJob {
  reportType: string;
  userId: string;
  filters?: any;
  format?: 'pdf' | 'excel' | 'csv';
}

@Processor(QUEUE_NAMES.REPORTS)
export class ReportProcessorService {
  private readonly logger = new Logger(ReportProcessorService.name);

  @Process('generate')
  async handleReportGeneration(job: Job<ReportJob>) {
    this.logger.log(`Generating ${job.data.reportType} report for user: ${job.data.userId}`);

    try {
      // Simulate report generation
      await this.delay(8000);

      this.logger.log(`Report generated successfully: ${job.data.reportType}`);
      return {
        success: true,
        reportId: `report-${Date.now()}`,
        downloadUrl: `/reports/download/${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Report generation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('schedule')
  async handleScheduledReport(job: Job<ReportJob & { schedule: string }>) {
    this.logger.log(`Processing scheduled report: ${job.data.reportType}`);

    try {
      await this.delay(5000);

      this.logger.log(`Scheduled report completed: ${job.data.reportType}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Scheduled report failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
