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
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { TimeEntryFilterDto } from './dto/time-entry-filter.dto';
import { TimeEntry } from './entities/time-entry.entity';

@ApiTags('Billing - Time Entries')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
@Controller('billing/time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    return await this.timeEntriesService.create(createTimeEntryDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body('entries') entries: CreateTimeEntryDto[]): Promise<TimeEntry[]> {
    return await this.timeEntriesService.bulkCreate(entries);
  }

  @Get()
  async findAll(@Query() filterDto: TimeEntryFilterDto): Promise<{ data: TimeEntry[]; total: number }> {
    return await this.timeEntriesService.findAll(filterDto);
  }

  @Get('case/:caseId')
  async findByCase(@Param('caseId') caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.findByCase(caseId);
  }

  @Get('case/:caseId/unbilled')
  async getUnbilledByCase(@Param('caseId') caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.getUnbilledByCase(caseId);
  }

  @Get('case/:caseId/totals')
  async getTotalsByCase(
    @Param('caseId') caseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    return await this.timeEntriesService.getTotalsByCase(caseId, startDate, endDate);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TimeEntry> {
    return await this.timeEntriesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTimeEntryDto: UpdateTimeEntryDto,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.update(id, updateTimeEntryDto);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string): Promise<TimeEntry> {
    return await this.timeEntriesService.approve(id, approvedBy);
  }

  @Put(':id/bill')
  async bill(
    @Param('id') id: string,
    @Body('invoiceId') invoiceId: string,
    @Body('billedBy') billedBy: string,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.bill(id, invoiceId, billedBy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.timeEntriesService.remove(id);
  }
}

