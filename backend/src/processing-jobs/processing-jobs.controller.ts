import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProcessingJobsService } from './processing-jobs.service';
import { JobType, JobStatus } from './dto/job-status.dto';

@ApiTags('processing-jobs')
@Controller('api/v1/processing-jobs')
export class ProcessingJobsController {
  constructor(private readonly processingJobsService: ProcessingJobsService) {}

  @Get()
  @ApiOperation({ summary: 'List all processing jobs' })
  @ApiQuery({ name: 'documentId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: JobType })
  @ApiQuery({ name: 'status', required: false, enum: JobStatus })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
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
  async getStatistics() {
    return await this.processingJobsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job status by ID' })
  @ApiResponse({ status: 200, description: 'Job status retrieved' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(@Param('id', ParseUUIDPipe) id: string) {
    return await this.processingJobsService.getJobStatus(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a processing job' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async cancelJob(@Param('id', ParseUUIDPipe) id: string) {
    return await this.processingJobsService.cancelJob(id);
  }
}
