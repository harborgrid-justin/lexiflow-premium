import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import {
  QueryAuditLogsDto,
  ExportAuditLogsDto,
  AuditEntityType,
  CreateRetentionPolicyDto,
} from './dto/audit-log.dto';

@Controller('api/v1/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  async export(@Query() exportDto: ExportAuditLogsDto) {
    return this.auditLogsService.export(exportDto);
  }

  @Get('statistics/:organizationId')
  async getStatistics(@Param('organizationId') organizationId: string) {
    return this.auditLogsService.getAuditStatistics(organizationId);
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogsService.findByEntity(entityType, entityId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUser(userId);
  }

  @Get('session/:sessionId')
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.auditLogsService.findBySession(sessionId);
  }

  @Get('sessions/active')
  async getActiveSessions() {
    return this.auditLogsService.getActiveSessions();
  }

  @Get('sessions/user/:userId')
  async getUserSessions(@Param('userId') userId: string) {
    return this.auditLogsService.getUserSessions(userId);
  }

  @Get('retention-policies')
  async getRetentionPolicies() {
    return this.auditLogsService.getRetentionPolicies();
  }

  @Post('retention-policies')
  @HttpCode(HttpStatus.CREATED)
  async createRetentionPolicy(@Body() dto: CreateRetentionPolicyDto) {
    return this.auditLogsService.createRetentionPolicy(dto);
  }

  @Post('retention-policies/apply')
  @HttpCode(HttpStatus.OK)
  async applyRetentionPolicies() {
    return this.auditLogsService.applyRetentionPolicies();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}
