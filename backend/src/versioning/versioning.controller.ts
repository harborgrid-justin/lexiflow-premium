import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VersioningService } from './versioning.service';

@ApiTags('Versioning')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public()
@Controller('versioning')
export class VersioningController {
  constructor(private readonly versioningService: VersioningService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new version' })
  async createVersion(@Body() body: any) {
    return await this.versioningService.createVersion(body);
  }

  @Get('history/:entityType/:entityId')
  @ApiOperation({ summary: 'Get version history' })
  async getVersionHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: any,
  ) {
    return await this.versioningService.getVersionHistory(entityType, entityId, query);
  }

  @Get('branches/:entityType/:entityId')
  @ApiOperation({ summary: 'Get branches' })
  async getBranches(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.versioningService.getBranches(entityType, entityId);
  }

  @Get('tags/:entityType/:entityId')
  @ApiOperation({ summary: 'Get tags' })
  async getTags(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.versioningService.getTags(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get version by ID' })
  async getVersion(@Param('id') id: string) {
    return await this.versioningService.getVersion(id);
  }

  @Post(':id/tag')
  @ApiOperation({ summary: 'Tag version' })
  async tagVersion(@Param('id') id: string, @Body() body: { tag: string }) {
    return await this.versioningService.tagVersion(id, body.tag);
  }

  @Get('compare/:id1/:id2')
  @ApiOperation({ summary: 'Compare two versions' })
  async compareVersions(@Param('id1') id1: string, @Param('id2') id2: string) {
    return await this.versioningService.compareVersions(id1, id2);
  }
}
