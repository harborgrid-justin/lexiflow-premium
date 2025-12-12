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
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';
import {
  CaseResponseDto,
  PaginatedCaseResponseDto,
  BulkDeleteDto,
  BulkUpdateStatusDto,
  CaseExportDto,
} from './dto/case-response.dto';

@ApiTags('cases')
@ApiBearerAuth()
@Controller('api/v1/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all cases with filtering and pagination',
    description: 'Retrieve a paginated list of cases with optional filters, sorting, and related data inclusion',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved cases',
    type: PaginatedCaseResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(@Query() filterDto: CaseFilterDto): Promise<PaginatedCaseResponseDto> {
    return this.casesService.findAll(filterDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search cases',
    description: 'Full-text search across case titles, numbers, and descriptions',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query',
    example: 'Smith construction',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: PaginatedCaseResponseDto,
  })
  async search(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedCaseResponseDto> {
    return this.casesService.search(query, page, limit);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export cases',
    description: 'Export cases to CSV, Excel, or PDF format',
  })
  @ApiQuery({
    name: 'format',
    required: true,
    enum: ['csv', 'excel', 'pdf'],
    description: 'Export format',
    example: 'excel',
  })
  @ApiResponse({
    status: 200,
    description: 'File download stream',
  })
  async export(
    @Query('format') format: 'csv' | 'excel' | 'pdf',
    @Query() filters: CaseFilterDto,
  ) {
    return this.casesService.export(format, filters);
  }

  @Get('statistics/summary')
  @ApiOperation({
    summary: 'Get case statistics summary',
    description: 'Retrieve aggregate statistics for all cases (counts by status, type, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Case statistics',
  })
  async getGlobalStatistics() {
    return this.casesService.getGlobalStatistics();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get case by ID',
    description: 'Retrieve detailed information about a specific case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case retrieved successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CaseResponseDto> {
    return this.casesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new case',
    description: 'Create a new case with all required and optional information',
  })
  @ApiBody({
    type: CreateCaseDto,
    description: 'Case creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Case created successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Case number already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    return this.casesService.create(createCaseDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update case (full update)',
    description: 'Replace all case fields with new data',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateCaseDto,
    description: 'Case update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Case updated successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCaseDto: UpdateCaseDto,
  ): Promise<CaseResponseDto> {
    return this.casesService.update(id, updateCaseDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partial update case',
    description: 'Update specific fields of a case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case updated successfully',
    type: CaseResponseDto,
  })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCaseDto: Partial<UpdateCaseDto>,
  ): Promise<CaseResponseDto> {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete case',
    description: 'Soft delete a case by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Case deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.casesService.remove(id);
  }

  @Post('bulk/delete')
  @ApiOperation({
    summary: 'Bulk delete cases',
    description: 'Delete multiple cases at once',
  })
  @ApiBody({
    type: BulkDeleteDto,
    description: 'Array of case UUIDs to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Cases deleted successfully',
  })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.casesService.bulkDelete(bulkDeleteDto.ids);
  }

  @Post('bulk/update-status')
  @ApiOperation({
    summary: 'Bulk update case status',
    description: 'Update status for multiple cases at once',
  })
  @ApiBody({
    type: BulkUpdateStatusDto,
    description: 'Case IDs and new status',
  })
  @ApiResponse({
    status: 200,
    description: 'Cases updated successfully',
  })
  async bulkUpdateStatus(@Body() bulkUpdateDto: BulkUpdateStatusDto) {
    return this.casesService.bulkUpdateStatus(bulkUpdateDto.ids, bulkUpdateDto.status);
  }

  @Post(':id/archive')
  @ApiOperation({
    summary: 'Archive case',
    description: 'Archive a case (sets isArchived flag)',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case archived successfully',
    type: CaseResponseDto,
  })
  async archive(@Param('id', ParseUUIDPipe) id: string): Promise<CaseResponseDto> {
    return this.casesService.archive(id);
  }

  @Post(':id/unarchive')
  @ApiOperation({
    summary: 'Unarchive case',
    description: 'Restore archived case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case unarchived successfully',
    type: CaseResponseDto,
  })
  async unarchive(@Param('id', ParseUUIDPipe) id: string): Promise<CaseResponseDto> {
    return this.casesService.unarchive(id);
  }

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Get case timeline',
    description: 'Retrieve chronological timeline of events for a case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'eventType',
    required: false,
    description: 'Filter by event type',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for timeline',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for timeline',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of events',
  })
  @ApiResponse({
    status: 200,
    description: 'Timeline events',
  })
  async getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.casesService.getTimeline(id, {
      eventType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id/workflow/transitions')
  @ApiOperation({
    summary: 'Get available workflow transitions',
    description: 'Get list of available status transitions for a case based on current state',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Available transitions',
  })
  async getAvailableTransitions(@Param('id', ParseUUIDPipe) id: string) {
    return this.casesService.getAvailableTransitions(id);
  }

  @Post(':id/workflow/transition')
  @ApiOperation({
    summary: 'Execute workflow transition',
    description: 'Transition case to a new status',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transition executed successfully',
  })
  async executeTransition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('transition') transition: string,
  ) {
    return this.casesService.executeTransition(id, transition);
  }

  @Get(':id/statistics')
  @ApiOperation({
    summary: 'Get case statistics',
    description: 'Retrieve statistics for a specific case (document count, time entries, billing, etc.)',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case statistics',
  })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.casesService.getStatistics(id);
  }

  @Get(':id/documents')
  @ApiOperation({
    summary: 'Get case documents',
    description: 'Retrieve all documents associated with a case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case documents',
  })
  async getDocuments(@Param('id', ParseUUIDPipe) id: string) {
    return this.casesService.getDocuments(id);
  }

  @Get(':id/parties')
  @ApiOperation({
    summary: 'Get case parties',
    description: 'Retrieve all parties associated with a case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case parties',
  })
  async getParties(@Param('id', ParseUUIDPipe) id: string) {
    return this.casesService.getParties(id);
  }

  @Get(':id/team')
  @ApiOperation({
    summary: 'Get case team',
    description: 'Retrieve team members assigned to a case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Case team members',
  })
  async getTeam(@Param('id', ParseUUIDPipe) id: string) {
    return this.casesService.getTeam(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({
    summary: 'Duplicate case',
    description: 'Create a copy of an existing case',
  })
  @ApiParam({
    name: 'id',
    description: 'Case UUID to duplicate',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Case duplicated successfully',
    type: CaseResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async duplicate(@Param('id', ParseUUIDPipe) id: string): Promise<CaseResponseDto> {
    return this.casesService.duplicate(id);
  }
}
