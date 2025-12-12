import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './generators/pdf-generator.service';
import { ExcelGeneratorService } from './generators/excel-generator.service';

@Module({
  imports: [
    // TypeOrmModule.forFeature([
    //   Report,
    // ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, PdfGeneratorService, ExcelGeneratorService],
  exports: [ReportsService, PdfGeneratorService, ExcelGeneratorService],
})
export class ReportsModule {}
