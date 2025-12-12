import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ComplianceReportingService } from './compliance-reporting.service';
import {
  GenerateAccessReportDto,
  GenerateActivityReportDto,
  GenerateConflictsReportDto,
  GenerateEthicalWallsReportDto,
} from './dto/compliance-report.dto';

@Controller('api/v1/compliance/reports')
export class ComplianceReportingController {
  constructor(
    private readonly reportingService: ComplianceReportingService,
  ) {}

  @Get('access')
  @HttpCode(HttpStatus.OK)
  async generateAccessReport(@Query() dto: GenerateAccessReportDto) {
    return this.reportingService.generateAccessReport(dto);
  }

  @Get('activity')
  @HttpCode(HttpStatus.OK)
  async generateActivityReport(@Query() dto: GenerateActivityReportDto) {
    return this.reportingService.generateActivityReport(dto);
  }

  @Get('conflicts')
  @HttpCode(HttpStatus.OK)
  async generateConflictsReport(@Query() dto: GenerateConflictsReportDto) {
    return this.reportingService.generateConflictsReport(dto);
  }

  @Get('ethical-walls')
  @HttpCode(HttpStatus.OK)
  async generateEthicalWallsReport(@Query() dto: GenerateEthicalWallsReportDto) {
    return this.reportingService.generateEthicalWallsReport(dto);
  }
}
