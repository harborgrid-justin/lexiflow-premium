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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import {
  QueryAuditLogsDto,
  ExportAuditLogsDto,
  AuditEntityType,
} from './dto/audit-log.dto';

@ApiTags('Compliance - Audit Logs')
@ApiBearerAuth('JWT-auth')
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}
