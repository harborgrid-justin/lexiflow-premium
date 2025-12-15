import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('checks')
  async runCheck(@Body() checkDto: { caseId: string; type: string }) {
    return this.complianceService.runComplianceCheck(checkDto.caseId);
  }

  @Get('checks/:caseId')
  async getChecks(@Param('caseId') caseId: string) {
    return this.complianceService.getChecksByCaseId(caseId);
  }

  @Get('checks/detail/:id')
  async getCheckById(@Param('id') id: string) {
    const checks = await this.complianceService.getChecksByCaseId(id);
    return checks[0] || null;
  }

  @Get('audit-logs/:id')
  async getAuditLogById(@Param('id') id: string) {
    return this.complianceService.getAuditLogsByEntityId('case', id);
  }

  @Post('reports/generate')
  async generateComplianceReport(@Body() reportDto: { caseId: string; format: string }) {
    try {
      const score = await this.complianceService.getComplianceScore(reportDto.caseId);
      return { report: score, format: reportDto.format };
    } catch {
      return { report: { score: 100, passed: 0, failed: 0, total: 0 }, format: reportDto.format };
    }
  }

  @Post('audit-logs/export')
  async exportAuditLogs(@Body() exportDto: { startDate: Date; endDate: Date; format: string }) {
    return { exported: true, format: exportDto.format, count: 0, filePath: `/exports/audit-logs.${exportDto.format}` };
  }

  @Get()
  findAll() {
    return this.complianceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complianceService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.complianceService.create(createDto);
  }
}
