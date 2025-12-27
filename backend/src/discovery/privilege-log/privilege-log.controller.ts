import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrivilegeLogService } from './privilege-log.service';
import { CreatePrivilegeLogEntryDto } from './dto/create-privilege-log-entry.dto';
import { UpdatePrivilegeLogEntryDto } from './dto/update-privilege-log-entry.dto';
import { QueryPrivilegeLogEntryDto } from './dto/query-privilege-log-entry.dto';


@UseGuards(JwtAuthGuard)
@Controller('privilege-log')
@UseInterceptors(CacheInterceptor)
export class PrivilegeLogController {
  constructor(private readonly privilegeLogService: PrivilegeLogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDto: CreatePrivilegeLogEntryDto) {
    return await this.privilegeLogService.create(createDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() queryDto: QueryPrivilegeLogEntryDto) {
    return await this.privilegeLogService.findAll(queryDto);
  }

  @Get('export/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportLog(@Param('caseId') caseId: string) {
    return await this.privilegeLogService.exportLog(caseId);
  }

  @Get('statistics/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.privilegeLogService.getStatistics(caseId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return await this.privilegeLogService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrivilegeLogEntryDto,
  ) {
    return await this.privilegeLogService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.privilegeLogService.remove(id);
  }
}

