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
} from '@nestjs/common';
import { PrivilegeLogService } from './privilege-log.service';
import { CreatePrivilegeLogEntryDto } from './dto/create-privilege-log-entry.dto';
import { UpdatePrivilegeLogEntryDto } from './dto/update-privilege-log-entry.dto';
import { QueryPrivilegeLogEntryDto } from './dto/query-privilege-log-entry.dto';

@Controller('api/v1/discovery/privilege-log')
export class PrivilegeLogController {
  constructor(private readonly privilegeLogService: PrivilegeLogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePrivilegeLogEntryDto) {
    return await this.privilegeLogService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryPrivilegeLogEntryDto) {
    return await this.privilegeLogService.findAll(queryDto);
  }

  @Get('export/:caseId')
  async exportLog(@Param('caseId') caseId: string) {
    return await this.privilegeLogService.exportLog(caseId);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.privilegeLogService.getStatistics(caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.privilegeLogService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrivilegeLogEntryDto,
  ) {
    return await this.privilegeLogService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.privilegeLogService.remove(id);
  }
}
