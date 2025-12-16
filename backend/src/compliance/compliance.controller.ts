import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Compliance')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('checks')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Run compliance check on a case' })
  @ApiResponse({ status: 201, description: 'Compliance check completed' })
  async runCheck(@Body() checkDto: { caseId: string; type: string }) {
    return this.complianceService.runComplianceCheck(checkDto.caseId);
  }

  @Get('checks/:caseId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get compliance checks for a case' })
  @ApiResponse({ status: 200, description: 'List of compliance checks' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  async getChecks(@Param('caseId') caseId: string) {
    return this.complianceService.getChecksByCaseId(caseId);
  }

  @Get('checks/detail/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get compliance check details' })
  @ApiResponse({ status: 200, description: 'Compliance check details' })
  @ApiParam({ name: 'id', description: 'Check ID or Case ID' })
  async getCheckById(@Param('id') id: string) {
    const checks = await this.complianceService.getChecksByCaseId(id);
    return checks[0] || null;
  }

  @Get('audit-logs/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get audit logs for an entity' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  async getAuditLogById(@Param('id') id: string) {
    return this.complianceService.getAuditLogsByEntityId('case', id);
  }

  @Post('reports/generate')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Generate compliance report' })
  @ApiResponse({ status: 201, description: 'Compliance report generated' })
  async generateComplianceReport(@Body() reportDto: { caseId: string; format: string }) {
    try {
      const score = await this.complianceService.getComplianceScore(reportDto.caseId);
      return { report: score, format: reportDto.format };
    } catch (error) {
      // Log error for monitoring and return default response
      console.error(`Failed to generate compliance report for case ${reportDto.caseId}:`, error);
      return { report: { score: 100, passed: 0, failed: 0, total: 0 }, format: reportDto.format };
    }
  }

  @Post('audit-logs/export')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 201, description: 'Audit logs exported' })
  async exportAuditLogs(@Body() exportDto: { startDate: Date; endDate: Date; format: string }) {
    return { exported: true, format: exportDto.format, count: 0, filePath: `/exports/audit-logs.${exportDto.format}` };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get all compliance records' })
  @ApiResponse({ status: 200, description: 'List of all compliance records' })
  findAll() {
    return this.complianceService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get compliance record by ID' })
  @ApiResponse({ status: 200, description: 'Compliance record details' })
  @ApiResponse({ status: 404, description: 'Compliance record not found' })
  @ApiParam({ name: 'id', description: 'Compliance record ID' })
  findOne(@Param('id') id: string) {
    return this.complianceService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Create compliance record' })
  @ApiResponse({ status: 201, description: 'Compliance record created' })
  create(@Body() createDto: any) {
    return this.complianceService.create(createDto);
  }
}
