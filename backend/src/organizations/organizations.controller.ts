import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';
import { Organization, OrganizationType, OrganizationStatus } from './entities/organization.entity';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully', type: Organization })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() organizationData: Partial<Organization>): Promise<Organization> {
    return this.organizationsService.create(organizationData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully', type: [Organization] })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for organization name' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (search) {
      return this.organizationsService.search(search);
    }
    return this.organizationsService.findAll(page, limit);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get organizations by type' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully', type: [Organization] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByType(
    @Param('type') type: OrganizationType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.organizationsService.findByType(type, page, limit);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get organizations by status' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully', type: [Organization] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByStatus(@Param('status') status: OrganizationStatus): Promise<Organization[]> {
    return this.organizationsService.findByStatus(status);
  }

  @Get('jurisdiction/:jurisdiction')
  @ApiOperation({ summary: 'Get organizations by jurisdiction' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully', type: [Organization] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByJurisdiction(@Param('jurisdiction') jurisdiction: string): Promise<Organization[]> {
    return this.organizationsService.findByJurisdiction(jurisdiction);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully', type: Organization })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string): Promise<Organization> {
    return this.organizationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully', type: Organization })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Organization>,
  ): Promise<Organization> {
    return this.organizationsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.organizationsService.remove(id);
  }
}
