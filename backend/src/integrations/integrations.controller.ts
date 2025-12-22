import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.integrationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiResponse({ status: 200, description: 'Integration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({ status: 201, description: 'Integration created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(
    @Body() integrationData: CreateIntegrationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.integrationsService.create(integrationData, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an integration' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Param('id') id: string, @Body() updateData: UpdateIntegrationDto) {
    return this.integrationsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an integration' })
  @ApiResponse({ status: 200, description: 'Integration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.integrationsService.remove(id);
  }

  @Post(':id/connect')
  @ApiOperation({ summary: 'Connect an integration' })
  @ApiResponse({ status: 200, description: 'Integration connected successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async connect(
    @Param('id') id: string,
    @Body() credentials: { accessToken: string; refreshToken: string },
  ) {
    return this.integrationsService.connect(id, credentials);
  }

  @Post(':id/disconnect')
  @ApiOperation({ summary: 'Disconnect an integration' })
  @ApiResponse({ status: 200, description: 'Integration disconnected successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async disconnect(@Param('id') id: string) {
    return this.integrationsService.disconnect(id);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: 'Refresh integration credentials' })
  @ApiResponse({ status: 200, description: 'Credentials refreshed successfully' })
  @ApiResponse({ status: 400, description: 'Integration must be active' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async refreshCredentials(@Param('id') id: string) {
    return this.integrationsService.refreshCredentials(id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync an integration' })
  @ApiResponse({ status: 200, description: 'Integration synced successfully' })
  @ApiResponse({ status: 400, description: 'Sync not enabled' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async sync(@Param('id') id: string) {
    return this.integrationsService.sync(id);
  }

  @Get(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async testConnection(@Param('id') id: string) {
    const integration = await this.integrationsService.findOne(id);
    return { status: integration.status, connected: integration.status === 'active' };
  }
}
