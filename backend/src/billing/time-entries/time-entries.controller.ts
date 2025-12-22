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
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { TimeEntryFilterDto } from './dto/time-entry-filter.dto';
import { TimeEntry } from './entities/time-entry.entity';

@ApiTags('Billing - Time Entries')
@ApiBearerAuth('JWT-auth')

@Controller('billing/time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    return await this.timeEntriesService.create(createTimeEntryDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async bulkCreate(@Body('entries') entries: CreateTimeEntryDto[]): Promise<TimeEntry[]> {
    return await this.timeEntriesService.bulkCreate(entries);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() filterDto: TimeEntryFilterDto): Promise<{ data: TimeEntry[]; total: number }> {
    return await this.timeEntriesService.findAll(filterDto);
  }

  @Get('case/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByCase(@Param('caseId') caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.findByCase(caseId);
  }

  @Get('case/:caseId/unbilled')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUnbilledByCase(@Param('caseId') caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.getUnbilledByCase(caseId);
  }

  @Get('case/:caseId/totals')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTotalsByCase(
    @Param('caseId') caseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    return await this.timeEntriesService.getTotalsByCase(caseId, startDate, endDate);
  }

  @Get('user/:userId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByUser(@Param('userId') userId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.findByUser(userId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<TimeEntry> {
    return await this.timeEntriesService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTimeEntryDto: UpdateTimeEntryDto,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.update(id, updateTimeEntryDto);
  }

  @Put(':id/approve')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string): Promise<TimeEntry> {
    return await this.timeEntriesService.approve(id, approvedBy);
  }

  @Put(':id/bill')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async bill(
    @Param('id') id: string,
    @Body('invoiceId') invoiceId: string,
    @Body('billedBy') billedBy: string,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.bill(id, invoiceId, billedBy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.timeEntriesService.remove(id);
  }

  @Post('bulk-approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve multiple time entries' })
  @ApiResponse({ status: 200, description: 'Time entries approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async approveBulk(
    @Body('ids') ids: string[],
    @Body('approvedBy') approvedBy: string,
  ): Promise<{ success: boolean; approved: number }> {
    return await this.timeEntriesService.approveBulk(ids, approvedBy);
  }

  @Post('bulk-bill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bill multiple time entries' })
  @ApiResponse({ status: 200, description: 'Time entries billed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async billBulk(
    @Body('ids') ids: string[],
    @Body('invoiceId') invoiceId: string,
    @Body('billedBy') billedBy: string,
  ): Promise<{ success: boolean; billed: number }> {
    return await this.timeEntriesService.billBulk(ids, invoiceId, billedBy);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete multiple time entries' })
  @ApiResponse({ status: 200, description: 'Time entries deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteBulk(@Body('ids') ids: string[]): Promise<{ success: boolean; deleted: number }> {
    return await this.timeEntriesService.deleteBulk(ids);
  }
}

