import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
 }from '@nestjs/swagger';
import { ServiceJobsService } from './service-jobs.service';
import {
  CreateServiceJobDto,
  UpdateServiceJobDto,
  CompleteServiceDto,
  ServiceJobQueryDto,
} from './dto';

/**
 * Service Jobs Controller
 *
 * REST API endpoints for service of process tracking
 * Manages process server assignments and service completion
 *
 * @class ServiceJobsController
 */
@ApiTags('Service of Process')

@Controller('service-jobs')
// @UseGuards(JwtAuthGuard) // Will be enabled once auth module is ready
@ApiBearerAuth()
export class ServiceJobsController {
  constructor(private readonly serviceJobsService: ServiceJobsService) {}

  /**
   * GET /api/v1/service-jobs
   * List all service jobs
   */
  @Get()
  @ApiOperation({ summary: 'List all service jobs' })
  @ApiResponse({ status: 200, description: 'Returns paginated service jobs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getServiceJobs(@Query() query: ServiceJobQueryDto, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.serviceJobsService.findAll(query, userId);
  }

  /**
   * GET /api/v1/service-jobs/:id
   * Get service job by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get service job by ID' })
  @ApiResponse({ status: 200, description: 'Returns service job details' })
  @ApiResponse({ status: 404, description: 'Service job not found' })
  @ApiParam({ name: 'id', description: 'Service job ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getServiceJobById(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.serviceJobsService.findById(id, userId);
  }

  /**
   * POST /api/v1/service-jobs
   * Create new service job
   */
  @Post()
  @ApiOperation({ summary: 'Create new service job' })
  @ApiResponse({ status: 201, description: 'Service job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createServiceJob(@Body() createDto: CreateServiceJobDto, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.serviceJobsService.create(createDto, userId);
  }

  /**
   * PUT /api/v1/service-jobs/:id
   * Update service job
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update service job' })
  @ApiResponse({ status: 200, description: 'Service job updated successfully' })
  @ApiResponse({ status: 404, description: 'Service job not found' })
  @ApiParam({ name: 'id', description: 'Service job ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateServiceJob(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceJobDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.serviceJobsService.update(id, updateDto, userId);
  }

  /**
   * POST /api/v1/service-jobs/:id/complete
   * Complete service job
   */
  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete service job and record proof of service' })
  @ApiResponse({ status: 200, description: 'Service job completed successfully' })
  @ApiResponse({ status: 404, description: 'Service job not found' })
  @ApiParam({ name: 'id', description: 'Service job ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async completeService(
    @Param('id') id: string,
    @Body() completeDto: CompleteServiceDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.serviceJobsService.completeService(id, completeDto, userId);
  }

  /**
   * POST /api/v1/service-jobs/:id/assign
   * Assign process server
   */
  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign process server to service job' })
  @ApiResponse({ status: 200, description: 'Process server assigned successfully' })
  @ApiResponse({ status: 404, description: 'Service job not found' })
  @ApiParam({ name: 'id', description: 'Service job ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async assignProcessServer(
    @Param('id') id: string,
    @Body('processServerId') processServerId: string,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.serviceJobsService.assignProcessServer(id, processServerId, userId);
  }

  /**
   * POST /api/v1/service-jobs/:id/cancel
   * Cancel service job
   */
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel service job' })
  @ApiResponse({ status: 200, description: 'Service job cancelled' })
  @ApiResponse({ status: 404, description: 'Service job not found' })
  @ApiParam({ name: 'id', description: 'Service job ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async cancelServiceJob(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.serviceJobsService.cancel(id, reason, userId);
  }
}

