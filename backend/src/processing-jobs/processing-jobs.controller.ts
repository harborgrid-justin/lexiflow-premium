import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProcessingJobsService } from './processing-jobs.service';
import { JobType, JobStatus } from './dto/job-status.dto';

@ApiTags('Processing Jobs')
@ApiBearerAuth('JWT-auth')

@Controller('processing-jobs')
export class ProcessingJobsController {
  constructor(private readonly processingJobsService: ProcessingJobsService) {}

  @Get()
  @ApiOperation({ summary: 'List all processing jobs' })
  @ApiQuery({ name: 'documentId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: JobType })
  @ApiQuery({ name: 'status', required: false, enum: JobStatus })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('documentId') documentId?: string,
    @Query('type') type?: JobType,
    @Query('status') status?: JobStatus,
  ) {
    return await this.processingJobsService.findAll(documentId, type, status);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get job statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatistics() {
    return await this.processingJobsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job status by ID' })
  @ApiResponse({ status: 200, description: 'Job status retrieved' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getJob(@Param('id', ParseUUIDPipe) id: string) {
    return await this.processingJobsService.findOne(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get detailed job status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getJobStatus(@Param('id', ParseUUIDPipe) id: string) {
    return await this.processingJobsService.getJobStatus(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a processing job' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async cancelJob(@Param('id', ParseUUIDPipe) id: string) {
    return await this.processingJobsService.cancelJob(id);
  }
}

