import { Controller, Get, Post, Body, Param, Query, Head, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation  , ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { VersioningService } from './versioning.service';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Versioning')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('versioning')
export class VersioningController {
  constructor(private readonly versioningService: VersioningService) {}

  @Public()
  @Head('health')
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health(): { status: string; service: string } {
    return { status: 'ok', service: 'versioning' };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new version' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createVersion(@Body() body: Record<string, unknown>): Promise<unknown> {
    return await this.versioningService.createVersion(body as any);
  }

  @Get('history/:entityType/:entityId')
  @ApiOperation({ summary: 'Get version history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getVersionHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: Record<string, unknown>,
  ): Promise<unknown> {
    return await this.versioningService.getVersionHistory(entityType, entityId, query);
  }

  @Get('branches/:entityType/:entityId')
  @ApiOperation({ summary: 'Get branches' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getBranches(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<unknown> {
    return await this.versioningService.getBranches(entityType, entityId);
  }

  @Get('tags/:entityType/:entityId')
  @ApiOperation({ summary: 'Get tags' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTags(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<unknown> {
    return await this.versioningService.getTags(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get version by ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getVersion(@Param('id') id: string): Promise<unknown> {
    return await this.versioningService.getVersion(id);
  }

  @Post(':id/tag')
  @ApiOperation({ summary: 'Tag version' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async tagVersion(@Param('id') id: string, @Body() body: { tag: string }): Promise<unknown> {
    return await this.versioningService.tagVersion(id, body.tag);
  }

  @Get('compare/:id1/:id2')
  @ApiOperation({ summary: 'Compare two versions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async compareVersions(@Param('id1') id1: string, @Param('id2') id2: string): Promise<unknown> {
    return await this.versioningService.compareVersions(id1, id2);
  }
}
