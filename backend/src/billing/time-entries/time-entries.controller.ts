import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { TimeEntryFilterDto } from './dto/time-entry-filter.dto';
import { TimeEntry } from './entities/time-entry.entity';

@ApiTags('time-entries')
@ApiBearerAuth()
@Controller('api/v1/billing/time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new time entry',
    description: 'Record billable or non-billable time spent on a case or task'
  })
  @ApiBody({ type: CreateTimeEntryDto })
  @ApiResponse({
    status: 201,
    description: 'Time entry created successfully',
    type: TimeEntry,
  })
  @ApiResponse({ status: 400, description: 'Invalid time entry data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    return await this.timeEntriesService.create(createTimeEntryDto);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk create time entries',
    description: 'Create multiple time entries at once for batch import or timer session recording'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        entries: {
          type: 'array',
          items: { $ref: '#/components/schemas/CreateTimeEntryDto' }
        }
      },
      required: ['entries']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Time entries created successfully',
    type: [TimeEntry],
  })
  @ApiResponse({ status: 400, description: 'Invalid time entry data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body('entries') entries: CreateTimeEntryDto[]): Promise<TimeEntry[]> {
    return await this.timeEntriesService.bulkCreate(entries);
  }

  @Get()
  @ApiOperation({
    summary: 'List all time entries with filtering and pagination',
    description: 'Retrieve paginated list of time entries with filters for case, user, date range, billable status'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case UUID' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user UUID' })
  @ApiQuery({ name: 'billable', required: false, type: Boolean, description: 'Filter by billable status' })
  @ApiQuery({ name: 'billed', required: false, type: Boolean, description: 'Filter by billed status' })
  @ApiQuery({ name: 'approved', required: false, type: Boolean, description: 'Filter by approval status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO 8601)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'date', description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC', description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Time entries retrieved successfully',
    schema: {
      example: {
        data: [],
        total: 150,
        page: 1,
        limit: 20,
        totalPages: 8
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() filterDto: TimeEntryFilterDto): Promise<{ data: TimeEntry[]; total: number }> {
    return await this.timeEntriesService.findAll(filterDto);
  }

  @Get('case/:caseId')
  @ApiOperation({
    summary: 'Get time entries for a specific case',
    description: 'Retrieve all time entries associated with a particular case'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiResponse({
    status: 200,
    description: 'Time entries retrieved successfully',
    type: [TimeEntry],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCase(@Param('caseId', ParseUUIDPipe) caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.findByCase(caseId);
  }

  @Get('case/:caseId/unbilled')
  @ApiOperation({
    summary: 'Get unbilled time entries for a case',
    description: 'Retrieve all time entries for a case that have not been billed yet'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiResponse({
    status: 200,
    description: 'Unbilled time entries retrieved successfully',
    type: [TimeEntry],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnbilledByCase(@Param('caseId', ParseUUIDPipe) caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.getUnbilledByCase(caseId);
  }

  @Get('case/:caseId/totals')
  @ApiOperation({
    summary: 'Get time entry totals for a case',
    description: 'Calculate total hours and amounts for a case, broken down by billable, billed, and unbilled'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for totals calculation' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for totals calculation' })
  @ApiResponse({
    status: 200,
    description: 'Totals calculated successfully',
    schema: {
      example: {
        total: 15000,
        billable: 13500,
        billed: 10000,
        unbilled: 3500,
        totalHours: 75,
        billableHours: 67.5,
        billedHours: 50,
        unbilledHours: 17.5
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTotalsByCase(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    return await this.timeEntriesService.getTotalsByCase(caseId, startDate, endDate);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get time entries for a specific user',
    description: 'Retrieve all time entries recorded by a specific user'
  })
  @ApiParam({ name: 'userId', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'User UUID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiResponse({
    status: 200,
    description: 'Time entries retrieved successfully',
    type: [TimeEntry],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<TimeEntry[]> {
    return await this.timeEntriesService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get time entry by ID',
    description: 'Retrieve detailed information about a specific time entry'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Time Entry UUID' })
  @ApiResponse({
    status: 200,
    description: 'Time entry retrieved successfully',
    type: TimeEntry,
  })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TimeEntry> {
    return await this.timeEntriesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Full update of time entry',
    description: 'Replace all time entry fields with new data. Cannot update billed entries.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Time Entry UUID' })
  @ApiBody({ type: UpdateTimeEntryDto })
  @ApiResponse({
    status: 200,
    description: 'Time entry updated successfully',
    type: TimeEntry,
  })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 400, description: 'Invalid time entry data or entry already billed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTimeEntryDto: UpdateTimeEntryDto,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.update(id, updateTimeEntryDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partial update of time entry',
    description: 'Update specific fields of a time entry without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Time Entry UUID' })
  @ApiBody({ type: UpdateTimeEntryDto })
  @ApiResponse({
    status: 200,
    description: 'Time entry updated successfully',
    type: TimeEntry,
  })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 400, description: 'Invalid time entry data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTimeEntryDto: Partial<UpdateTimeEntryDto>,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.update(id, updateTimeEntryDto);
  }

  @Put(':id/approve')
  @ApiOperation({
    summary: 'Approve time entry',
    description: 'Mark a time entry as approved by a supervisor or partner. Required before billing.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Time Entry UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedBy: { type: 'string', format: 'uuid', example: '423e4567-e89b-12d3-a456-426614174003' },
        notes: { type: 'string', example: 'Approved for billing' }
      },
      required: ['approvedBy']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry approved successfully',
    type: TimeEntry,
  })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 400, description: 'Time entry already approved or billed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvedBy') approvedBy: string,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.approve(id, approvedBy);
  }

  @Put(':id/bill')
  @ApiOperation({
    summary: 'Mark time entry as billed',
    description: 'Associate a time entry with an invoice. Locks the entry from further editing.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Time Entry UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoiceId: { type: 'string', format: 'uuid', example: '523e4567-e89b-12d3-a456-426614174005' },
        billedBy: { type: 'string', format: 'uuid', example: '423e4567-e89b-12d3-a456-426614174003' }
      },
      required: ['invoiceId', 'billedBy']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry marked as billed successfully',
    type: TimeEntry,
  })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 400, description: 'Time entry already billed or not approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('invoiceId') invoiceId: string,
    @Body('billedBy') billedBy: string,
  ): Promise<TimeEntry> {
    return await this.timeEntriesService.bill(id, invoiceId, billedBy);
  }

  @Post('timer/start')
  @ApiOperation({
    summary: 'Start time tracking timer',
    description: 'Start a timer for real-time time tracking. Creates a new time entry in progress.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        description: { type: 'string', example: 'Drafting motion to dismiss' },
        taskCode: { type: 'string', example: 'L100' }
      },
      required: ['caseId', 'userId']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Timer started successfully',
    schema: {
      example: {
        timerId: '623e4567-e89b-12d3-a456-426614174006',
        startTime: '2025-01-15T14:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'User already has an active timer' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async startTimer(@Body() body: any) {
    return await this.timeEntriesService.startTimer(body);
  }

  @Post('timer/stop')
  @ApiOperation({
    summary: 'Stop time tracking timer',
    description: 'Stop an active timer and create the final time entry with calculated duration'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timerId: { type: 'string', format: 'uuid' },
        description: { type: 'string', example: 'Completed drafting motion to dismiss' }
      },
      required: ['timerId']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Timer stopped successfully',
    type: TimeEntry,
  })
  @ApiResponse({ status: 404, description: 'Timer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async stopTimer(@Body() body: any) {
    return await this.timeEntriesService.stopTimer(body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete time entry',
    description: 'Soft delete a time entry. Cannot delete billed entries.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Time Entry UUID' })
  @ApiResponse({ status: 204, description: 'Time entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete billed time entry' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.timeEntriesService.remove(id);
  }

  @Post('bulk/approve')
  @ApiOperation({
    summary: 'Bulk approve time entries',
    description: 'Approve multiple time entries at once for efficient review workflow'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timeEntryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
        approvedBy: { type: 'string', format: 'uuid' }
      },
      required: ['timeEntryIds', 'approvedBy']
    }
  })
  @ApiResponse({ status: 200, description: 'Time entries approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid time entry IDs or already approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkApprove(@Body() body: { timeEntryIds: string[]; approvedBy: string }) {
    return await this.timeEntriesService.bulkApprove(body.timeEntryIds, body.approvedBy);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export time entries',
    description: 'Export time entries to CSV or Excel format for billing or reporting'
  })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'excel'], description: 'Export format' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case' })
  @ApiResponse({
    status: 200,
    description: 'Export file generated successfully',
    content: { 'application/octet-stream': {} }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async export(
    @Query('format') format: 'csv' | 'excel',
    @Query() filters: TimeEntryFilterDto,
  ) {
    return await this.timeEntriesService.export(format, filters);
  }
}
