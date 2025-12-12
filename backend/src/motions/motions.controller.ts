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
import { MotionsService } from './motions.service';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Motion } from './entities/motion.entity';

@ApiTags('motions')
@ApiBearerAuth()
@Controller('api/v1')
export class MotionsController {
  constructor(private readonly motionsService: MotionsService) {}

  @Get('cases/:caseId/motions')
  @ApiOperation({
    summary: 'Get all motions for a case',
    description: 'Retrieve all court motions filed or planned for a specific case'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by motion status' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by motion type' })
  @ApiResponse({
    status: 200,
    description: 'Motions retrieved successfully',
    type: [Motion],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async findAllByCaseId(@Param('caseId', ParseUUIDPipe) caseId: string): Promise<Motion[]> {
    return this.motionsService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/motions')
  @ApiOperation({
    summary: 'Create new motion',
    description: 'File a new court motion for a case with deadlines and supporting documents'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiBody({ type: CreateMotionDto })
  @ApiResponse({
    status: 201,
    description: 'Motion created successfully',
    type: Motion,
  })
  @ApiResponse({ status: 400, description: 'Invalid motion data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMotionDto: CreateMotionDto): Promise<Motion> {
    return this.motionsService.create(createMotionDto);
  }

  @Get('motions/:id')
  @ApiOperation({
    summary: 'Get motion by ID',
    description: 'Retrieve detailed information about a specific motion'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Motion UUID' })
  @ApiResponse({
    status: 200,
    description: 'Motion retrieved successfully',
    type: Motion,
  })
  @ApiResponse({ status: 404, description: 'Motion not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Motion> {
    return this.motionsService.findOne(id);
  }

  @Put('motions/:id')
  @ApiOperation({
    summary: 'Full update of motion',
    description: 'Replace all motion fields with new data'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Motion UUID' })
  @ApiBody({ type: UpdateMotionDto })
  @ApiResponse({
    status: 200,
    description: 'Motion updated successfully',
    type: Motion,
  })
  @ApiResponse({ status: 404, description: 'Motion not found' })
  @ApiResponse({ status: 400, description: 'Invalid motion data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMotionDto: UpdateMotionDto,
  ): Promise<Motion> {
    return this.motionsService.update(id, updateMotionDto);
  }

  @Patch('motions/:id')
  @ApiOperation({
    summary: 'Partial update of motion',
    description: 'Update specific fields of a motion without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Motion UUID' })
  @ApiBody({ type: UpdateMotionDto })
  @ApiResponse({
    status: 200,
    description: 'Motion updated successfully',
    type: Motion,
  })
  @ApiResponse({ status: 404, description: 'Motion not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMotionDto: Partial<UpdateMotionDto>,
  ): Promise<Motion> {
    return this.motionsService.update(id, updateMotionDto);
  }

  @Delete('motions/:id')
  @ApiOperation({
    summary: 'Delete motion',
    description: 'Soft delete a motion from a case'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Motion UUID' })
  @ApiResponse({ status: 204, description: 'Motion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Motion not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.motionsService.remove(id);
  }

  @Post('motions/:motionId/deadlines')
  @ApiOperation({
    summary: 'Create motion deadline',
    description: 'Add a deadline for a motion (e.g., filing deadline, hearing date, response due)'
  })
  @ApiParam({ name: 'motionId', type: String, format: 'uuid', description: 'Motion UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['filing', 'hearing', 'response', 'reply', 'other'], example: 'filing' },
        dueDate: { type: 'string', format: 'date-time', example: '2025-02-15T14:00:00Z' },
        description: { type: 'string', example: 'File motion with court' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' }
      },
      required: ['type', 'dueDate']
    }
  })
  @ApiResponse({ status: 201, description: 'Deadline created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid deadline data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async createDeadline(@Body() createDto: any) {
    return this.motionsService.createDeadline(createDto);
  }

  @Get('motions/:motionId/deadlines')
  @ApiOperation({
    summary: 'Get deadlines for a motion',
    description: 'Retrieve all deadlines associated with a specific motion'
  })
  @ApiParam({ name: 'motionId', type: String, format: 'uuid', description: 'Motion UUID' })
  @ApiResponse({ status: 200, description: 'Deadlines retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeadlines(@Param('motionId', ParseUUIDPipe) motionId: string) {
    return this.motionsService.getDeadlines(motionId);
  }

  @Get('cases/:caseId/motions/deadlines')
  @ApiOperation({
    summary: 'Get all motion deadlines for a case',
    description: 'Retrieve all motion-related deadlines for a case'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', description: 'Case UUID' })
  @ApiResponse({ status: 200, description: 'Deadlines retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCaseDeadlines(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.motionsService.getCaseDeadlines(caseId);
  }

  @Get('motions/deadlines/upcoming')
  @ApiOperation({
    summary: 'Get upcoming motion deadlines',
    description: 'Retrieve motion deadlines coming due within specified number of days'
  })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7, description: 'Number of days to look ahead' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by assigned user' })
  @ApiResponse({ status: 200, description: 'Upcoming deadlines retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUpcomingDeadlines(@Query('days') days?: string, @Query('userId') userId?: string) {
    return this.motionsService.getUpcomingDeadlines(
      days ? parseInt(days, 10) : 7,
      userId,
    );
  }

  @Get('motions/deadlines/overdue')
  @ApiOperation({
    summary: 'Get overdue motion deadlines',
    description: 'Retrieve all motion deadlines that are past due'
  })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by assigned user' })
  @ApiResponse({ status: 200, description: 'Overdue deadlines retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOverdueDeadlines(@Query('userId') userId?: string) {
    return this.motionsService.getOverdueDeadlines(userId);
  }

  @Post('motions/deadlines/:id/complete')
  @ApiOperation({
    summary: 'Mark deadline as completed',
    description: 'Record completion of a motion deadline'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Deadline UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        notes: { type: 'string', example: 'Motion filed with court clerk' }
      },
      required: ['userId']
    }
  })
  @ApiResponse({ status: 200, description: 'Deadline marked as completed' })
  @ApiResponse({ status: 404, description: 'Deadline not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeDeadline(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { userId: string; notes?: string },
  ) {
    return this.motionsService.completeDeadline(id, body.userId, body.notes);
  }

  @Get('motions/deadlines/alerts')
  @ApiOperation({
    summary: 'Get deadline alerts',
    description: 'Get alerts for approaching motion deadlines that require attention'
  })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7, description: 'Alert window in days' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeadlineAlerts(@Query('userId') userId?: string, @Query('days') days?: string) {
    return this.motionsService.getDeadlineAlerts(
      userId,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('motions/deadlines/statistics')
  @ApiOperation({
    summary: 'Get motion deadline statistics',
    description: 'Get statistics on motion deadlines (completed, upcoming, overdue)'
  })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        total: 25,
        completed: 15,
        upcoming: 7,
        overdue: 3,
        byType: {
          filing: 10,
          hearing: 8,
          response: 5,
          reply: 2
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeadlineStatistics(
    @Query('caseId') caseId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.motionsService.getDeadlineStatistics({ caseId, userId });
  }

  @Get('cases/:caseId/motions/by-status/:status')
  @ApiOperation({
    summary: 'Get motions by status',
    description: 'Filter case motions by their current status (draft, filed, pending, granted, denied)'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', description: 'Case UUID' })
  @ApiParam({ name: 'status', type: String, example: 'filed', enum: ['draft', 'filed', 'pending', 'granted', 'denied', 'withdrawn'], description: 'Motion status' })
  @ApiResponse({ status: 200, description: 'Motions retrieved successfully', type: [Motion] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByStatus(@Param('caseId', ParseUUIDPipe) caseId: string, @Param('status') status: string) {
    return this.motionsService.findByStatus(caseId, status);
  }

  @Get('cases/:caseId/motions/by-type/:type')
  @ApiOperation({
    summary: 'Get motions by type',
    description: 'Filter case motions by type (e.g., motion to dismiss, summary judgment, discovery)'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', description: 'Case UUID' })
  @ApiParam({ name: 'type', type: String, example: 'dismiss', description: 'Motion type' })
  @ApiResponse({ status: 200, description: 'Motions retrieved successfully', type: [Motion] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByType(@Param('caseId', ParseUUIDPipe) caseId: string, @Param('type') type: string) {
    return this.motionsService.findByType(caseId, type);
  }
}
