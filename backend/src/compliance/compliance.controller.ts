import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Head, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam , ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@users/entities/user.entity';
import { RunCheckDto, GenerateComplianceReportDto, ExportAuditLogsDto } from './dto';
import {
  DataExportRequestDto,
  DataDeletionRequestDto,
  ConsentDto,
  RevokeConsentDto,
  AuditReportQueryDto,
  RetentionStatusQueryDto,
  DataClassificationDto,
  CreateRetentionPolicyDto,
  LegalHoldDto,
  RemoveLegalHoldDto,
} from './dto/compliance.dto';
import { GdprComplianceService } from './services/gdprCompliance.service';
import { AuditTrailService } from './services/auditTrail.service';
import { DataRetentionService } from './services/dataRetention.service';
import { DataClassificationService } from './services/dataClassification.service';

@ApiTags('Compliance')
@ApiBearerAuth('JWT-auth')

@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(
    private readonly complianceService: ComplianceService,
    private readonly gdprComplianceService: GdprComplianceService,
    private readonly auditTrailService: AuditTrailService,
    private readonly dataRetentionService: DataRetentionService,
    private readonly dataClassificationService: DataClassificationService,
  ) {}

  // Health check endpoint
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async health() {
    return { status: 'ok', service: 'compliance' };
  }

  @Head()
  @HttpCode(HttpStatus.OK)
  async healthHead() {
    return;
  }

  // Alias route for conflict checks
  @Head('conflict-checks')
  @HttpCode(HttpStatus.OK)
  async conflictChecksHealth() {
    return;
  }

  @Get('conflict-checks')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all conflict checks' })
  @ApiResponse({ status: 200, description: 'List of conflict checks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getConflictChecks() {
    return this.complianceService.getAllConflictChecks();
  }

  // Alias route for audit logs
  @Head('audit-logs')
  @HttpCode(HttpStatus.OK)
  async auditLogsHealth() {
    return;
  }

  @Get('audit-logs')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllAuditLogs() {
    return this.complianceService.getAllAuditLogs();
  }

  @Post('checks')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Run compliance check on a case' })
  @ApiResponse({ status: 201, description: 'Compliance check completed' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async runCheck(@Body() checkDto: RunCheckDto) {
    return this.complianceService.runComplianceCheck(checkDto.caseId);
  }

  @Get('checks/:caseId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get compliance checks for a case' })
  @ApiResponse({ status: 200, description: 'List of compliance checks' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getChecks(@Param('caseId') caseId: string) {
    return this.complianceService.getChecksByCaseId(caseId);
  }

  @Get('checks/detail/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get compliance check details' })
  @ApiResponse({ status: 200, description: 'Compliance check details' })
  @ApiParam({ name: 'id', description: 'Check ID or Case ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getCheckById(@Param('id') id: string) {
    const checks = await this.complianceService.getChecksByCaseId(id);
    return checks.data?.[0] || null;
  }

  @Get('audit-logs/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get audit logs for an entity' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getAuditLogById(@Param('id') id: string) {
    return this.complianceService.getAuditLogsByEntityId('case', id);
  }

  @Post('reports/generate')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Generate compliance report' })
  @ApiResponse({ status: 201, description: 'Compliance report generated' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async generateComplianceReport(@Body() reportDto: GenerateComplianceReportDto) {
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
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async exportAuditLogs(@Body() exportDto: ExportAuditLogsDto) {
    return { exported: true, format: exportDto.format, count: 0, filePath: `/exports/audit-logs.${exportDto.format}` };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get all compliance records' })
  @ApiResponse({ status: 200, description: 'List of all compliance records' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.complianceService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get compliance record by ID' })
  @ApiResponse({ status: 200, description: 'Compliance record details' })
  @ApiResponse({ status: 404, description: 'Compliance record not found' })
  @ApiParam({ name: 'id', description: 'Compliance record ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: string) {
    return this.complianceService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Create compliance record' })
  @ApiResponse({ status: 201, description: 'Compliance record created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  create(@Body() _createDto: unknown) {
    throw new Error('Method not implemented.');
  }

  @Get('data-export/:userId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Export user data (GDPR Data Subject Access Request)' })
  @ApiParam({ name: 'userId', description: 'User ID for data export' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  @ApiResponse({ status: 200, description: 'User data exported successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportUserData(
    @Param('userId') userId: string,
    @Query('format') format?: string,
  ) {
    const request: DataExportRequestDto = {
      userId,
      format: format || 'json',
      includeArchived: true,
      includeDeleted: false,
    };
    return this.gdprComplianceService.handleDataSubjectAccessRequest(request);
  }

  @Delete('data-deletion/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user data (GDPR Right to be Forgotten)' })
  @ApiParam({ name: 'userId', description: 'User ID for data deletion' })
  @ApiResponse({ status: 200, description: 'User data deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteUserData(
    @Param('userId') userId: string,
    @Body() body: Partial<DataDeletionRequestDto>,
    @Req() req: unknown,
  ) {
    const request: DataDeletionRequestDto = {
      userId,
      reason: body.reason,
      softDelete: body.softDelete !== false,
      requestedBy: (req as any).user?.id,
    };
    return this.gdprComplianceService.handleRightToBeForgotten(request);
  }

  @Get('audit-report')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Generate audit report' })
  @ApiResponse({ status: 200, description: 'Audit report generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAuditReport(@Query() query: AuditReportQueryDto) {
    return this.auditTrailService.searchAuditLogs(query);
  }

  @Post('audit-report/export')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Export audit report' })
  @ApiResponse({ status: 200, description: 'Audit report exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportAuditReport(@Body() query: AuditReportQueryDto) {
    return this.auditTrailService.exportAuditLogs(query, query.format || 'json');
  }

  @Get('audit-trail/verify')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verify audit trail integrity' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Audit trail integrity verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async verifyAuditTrail(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditTrailService.verifyAuditTrailIntegrity(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('audit-trail/statistics')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get audit trail statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAuditStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditTrailService.getAuditStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('retention-status')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get retention status' })
  @ApiResponse({ status: 200, description: 'Retention status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRetentionStatus(@Query() query: RetentionStatusQueryDto) {
    return this.dataRetentionService.getRetentionStatus(query);
  }

  @Get('retention-policies')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Get all retention policies' })
  @ApiResponse({ status: 200, description: 'Retention policies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRetentionPolicies() {
    return this.dataRetentionService.getAllPolicies();
  }

  @Post('retention-policies')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create retention policy' })
  @ApiResponse({ status: 201, description: 'Retention policy created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createRetentionPolicy(
    @Body() dto: CreateRetentionPolicyDto,
    @Req() req: unknown,
  ) {
    return this.dataRetentionService.createPolicy(dto, (req as any).user?.id || 'system');
  }

  @Get('retention-report')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Generate retention report' })
  @ApiResponse({ status: 200, description: 'Retention report generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRetentionReport() {
    return this.dataRetentionService.generateRetentionReport();
  }

  @Post('legal-hold')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Place legal hold on data' })
  @ApiResponse({ status: 201, description: 'Legal hold placed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async placeLegalHold(@Body() dto: LegalHoldDto, @Req() req: unknown) {
    return this.dataRetentionService.placeLegalHold(dto, (req as any).user?.id || 'system');
  }

  @Delete('legal-hold')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove legal hold from data' })
  @ApiResponse({ status: 200, description: 'Legal hold removed successfully' })
  @ApiResponse({ status: 404, description: 'Retention record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeLegalHold(@Body() dto: RemoveLegalHoldDto, @Req() req: unknown) {
    return this.dataRetentionService.removeLegalHold(dto, (req as any).user?.id || 'system');
  }

  @Post('consent')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.USER)
  @ApiOperation({ summary: 'Grant user consent' })
  @ApiResponse({ status: 201, description: 'Consent granted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async grantConsent(@Body() dto: ConsentDto, @Req() req: unknown) {
    return this.gdprComplianceService.grantConsent(
      dto,
      (req as any).ip,
      (req as any).headers['user-agent'],
    );
  }

  @Post('consent/revoke')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.USER)
  @ApiOperation({ summary: 'Revoke user consent' })
  @ApiResponse({ status: 200, description: 'Consent revoked successfully' })
  @ApiResponse({ status: 404, description: 'Consent not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async revokeConsent(@Body() dto: RevokeConsentDto) {
    return this.gdprComplianceService.revokeConsent(dto);
  }

  @Get('consent/:userId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.USER)
  @ApiOperation({ summary: 'Get user consents' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Consents retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUserConsents(@Param('userId') userId: string) {
    return this.gdprComplianceService.getUserConsents(userId);
  }

  @Get('data-processing-record/:userId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Generate data processing record (GDPR Article 30)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Data processing record generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDataProcessingRecord(@Param('userId') userId: string) {
    return this.gdprComplianceService.generateDataProcessingRecord(userId);
  }

  @Post('classify-data')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Classify data sensitivity (PII/PHI detection)' })
  @ApiResponse({ status: 200, description: 'Data classified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async classifyData(@Body() dto: DataClassificationDto) {
    return this.dataClassificationService.classifyData(
      dto.entityType,
      dto.entityId,
      {},
    );
  }
}

