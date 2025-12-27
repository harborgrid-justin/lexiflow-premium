import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

/**
 * Reports Module
 * Custom report generation and scheduling
 * Features:
 * - Custom report builder
 * - Scheduled report generation
 * - Export to PDF, Excel, CSV
 * - Report templates library
 */
@Module({
  imports: [
    // TypeOrmModule.forFeature([
    //   Report,
    // ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
