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
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import {
  QueryAuditLogsDto,
  ExportAuditLogsDto,
  AuditEntityType,
} from './dto/audit-log.dto';

@ApiTags('Compliance - Audit Logs')
@ApiBearerAuth('JWT-auth')

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async export(@Query() exportDto: ExportAuditLogsDto) {
    return this.auditLogsService.export(exportDto);
  }

  @Get('entity/:entityType/:entityId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByEntity(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogsService.findByEntity(entityType, entityId);
  }

  @Get('user/:userId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUser(userId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}

