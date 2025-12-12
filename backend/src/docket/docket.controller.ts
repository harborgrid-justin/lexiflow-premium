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
import { DocketService } from './docket.service';
import { CreateDocketEntryDto } from './dto/create-docket-entry.dto';
import { UpdateDocketEntryDto } from './dto/update-docket-entry.dto';
import { PacerSyncDto, PacerSyncResultDto } from './dto/pacer-sync.dto';
import { DocketEntry } from './entities/docket-entry.entity';

@ApiTags('docket')
@ApiBearerAuth()
@Controller('api/v1')
export class DocketController {
  constructor(private readonly docketService: DocketService) {}

  @Get('cases/:caseId/docket')
  @ApiOperation({
    summary: 'Get docket entries for a case',
    description: 'Retrieve all docket entries (court filings and events) for a specific case in chronological order'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date' })
  @ApiQuery({ name: 'entryType', required: false, type: String, description: 'Filter by entry type' })
  @ApiResponse({
    status: 200,
    description: 'Docket entries retrieved successfully',
    type: [DocketEntry],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async findAllByCaseId(@Param('caseId', ParseUUIDPipe) caseId: string): Promise<DocketEntry[]> {
    return this.docketService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/docket')
  @ApiOperation({
    summary: 'Create docket entry',
    description: 'Manually add a new docket entry for a case (filing, hearing, order, etc.)'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiBody({ type: CreateDocketEntryDto })
  @ApiResponse({
    status: 201,
    description: 'Docket entry created successfully',
    type: DocketEntry,
  })
  @ApiResponse({ status: 400, description: 'Invalid docket entry data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDocketEntryDto: CreateDocketEntryDto): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Get('docket/:id')
  @ApiOperation({
    summary: 'Get docket entry by ID',
    description: 'Retrieve detailed information about a specific docket entry'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Docket Entry UUID' })
  @ApiResponse({
    status: 200,
    description: 'Docket entry retrieved successfully',
    type: DocketEntry,
  })
  @ApiResponse({ status: 404, description: 'Docket entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DocketEntry> {
    return this.docketService.findOne(id);
  }

  @Put('docket/:id')
  @ApiOperation({
    summary: 'Full update of docket entry',
    description: 'Replace all docket entry fields with new data'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Docket Entry UUID' })
  @ApiBody({ type: UpdateDocketEntryDto })
  @ApiResponse({
    status: 200,
    description: 'Docket entry updated successfully',
    type: DocketEntry,
  })
  @ApiResponse({ status: 404, description: 'Docket entry not found' })
  @ApiResponse({ status: 400, description: 'Invalid docket entry data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocketEntryDto: UpdateDocketEntryDto,
  ): Promise<DocketEntry> {
    return this.docketService.update(id, updateDocketEntryDto);
  }

  @Patch('docket/:id')
  @ApiOperation({
    summary: 'Partial update of docket entry',
    description: 'Update specific fields of a docket entry without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Docket Entry UUID' })
  @ApiBody({ type: UpdateDocketEntryDto })
  @ApiResponse({
    status: 200,
    description: 'Docket entry updated successfully',
    type: DocketEntry,
  })
  @ApiResponse({ status: 404, description: 'Docket entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocketEntryDto: Partial<UpdateDocketEntryDto>,
  ): Promise<DocketEntry> {
    return this.docketService.update(id, updateDocketEntryDto);
  }

  @Delete('docket/:id')
  @ApiOperation({
    summary: 'Delete docket entry',
    description: 'Soft delete a docket entry'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Docket Entry UUID' })
  @ApiResponse({ status: 204, description: 'Docket entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Docket entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.docketService.remove(id);
  }

  @Post('pacer/sync')
  @ApiOperation({
    summary: 'Sync docket from PACER',
    description: 'Automatically import and sync docket entries from PACER (Public Access to Court Electronic Records) system'
  })
  @ApiBody({ type: PacerSyncDto })
  @ApiResponse({
    status: 200,
    description: 'PACER sync completed successfully',
    type: PacerSyncResultDto,
    schema: {
      example: {
        success: true,
        entriesImported: 25,
        entriesUpdated: 5,
        entriesSkipped: 3,
        errors: [],
        syncedAt: '2025-01-15T14:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid PACER credentials or case number' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async syncFromPacer(@Body() pacerSyncDto: PacerSyncDto): Promise<PacerSyncResultDto> {
    return this.docketService.syncFromPacer(pacerSyncDto);
  }

  @Get('cases/:caseId/docket/timeline')
  @ApiOperation({
    summary: 'Get docket timeline',
    description: 'Retrieve docket entries formatted as a visual timeline for case history'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', description: 'Case UUID' })
  @ApiResponse({
    status: 200,
    description: 'Timeline retrieved successfully',
    schema: {
      example: {
        events: [
          {
            date: '2024-01-15',
            title: 'Complaint Filed',
            description: 'Plaintiff filed complaint',
            type: 'filing'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTimeline(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.docketService.getTimeline(caseId);
  }

  @Get('docket/search')
  @ApiOperation({
    summary: 'Search docket entries',
    description: 'Full-text search across all docket entries by description, filing party, or document title'
  })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query', example: 'motion to dismiss' })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      example: {
        data: [],
        total: 42,
        page: 1,
        limit: 20
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async search(
    @Query('q') query: string,
    @Query('caseId') caseId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.docketService.search(query, { caseId, startDate, endDate, page, limit });
  }

  @Get('cases/:caseId/docket/export')
  @ApiOperation({
    summary: 'Export docket sheet',
    description: 'Export docket entries to PDF or Excel format for filing or record-keeping'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', description: 'Case UUID' })
  @ApiQuery({ name: 'format', required: true, enum: ['pdf', 'excel'], description: 'Export format' })
  @ApiResponse({
    status: 200,
    description: 'Docket sheet exported successfully',
    content: { 'application/octet-stream': {} }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async export(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query('format') format: 'pdf' | 'excel',
  ) {
    return this.docketService.export(caseId, format);
  }
}
