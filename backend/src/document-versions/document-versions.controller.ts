import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseUUIDPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentVersionsService } from './document-versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { VersionComparisonService } from './services/version-comparison.service';
import { ChangeTrackingService } from './services/change-tracking.service';

@ApiTags('document-versions')
@Controller('api/v1/documents/:documentId/versions')
export class DocumentVersionsController {
  constructor(
    private readonly documentVersionsService: DocumentVersionsService,
    private readonly versionComparisonService: VersionComparisonService,
    private readonly changeTrackingService: ChangeTrackingService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new version of a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        changeDescription: { type: 'string' },
        metadata: { type: 'object' },
        caseId: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file', 'caseId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  async createVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body('caseId') caseId: string,
    @Body() createVersionDto: CreateVersionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.documentVersionsService.createVersion(
      documentId,
      caseId,
      file,
      createVersionDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get version history of a document' })
  @ApiResponse({ status: 200, description: 'Version history retrieved successfully' })
  async getVersionHistory(@Param('documentId', ParseUUIDPipe) documentId: string) {
    return await this.documentVersionsService.getVersionHistory(documentId);
  }

  @Get(':version')
  @ApiOperation({ summary: 'Get a specific version' })
  @ApiResponse({ status: 200, description: 'Version found' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async getVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return await this.documentVersionsService.getVersion(documentId, version);
  }

  @Get(':version/download')
  @ApiOperation({ summary: 'Download a specific version' })
  @ApiResponse({ status: 200, description: 'Version downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async downloadVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('version', ParseIntPipe) version: number,
    @Res() res: Response,
  ) {
    const { buffer, filename, mimeType } =
      await this.documentVersionsService.downloadVersion(documentId, version);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare two versions' })
  @ApiResponse({ status: 200, description: 'Comparison completed' })
  async compareVersions(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('v1', ParseIntPipe) version1: number,
    @Query('v2', ParseIntPipe) version2: number,
  ) {
    return await this.documentVersionsService.compareVersions(
      documentId,
      version1,
      version2,
    );
  }

  @Post(':version/restore')
  @ApiOperation({ summary: 'Restore a specific version' })
  @ApiResponse({ status: 201, description: 'Version restored successfully' })
  async restoreVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('version', ParseIntPipe) version: number,
    @Body('caseId') caseId: string,
  ) {
    return await this.documentVersionsService.restoreVersion(
      documentId,
      version,
      caseId,
    );
  }

  @Get('compare/detailed')
  @ApiOperation({ summary: 'Get detailed diff between two versions' })
  @ApiResponse({ status: 200, description: 'Detailed comparison completed' })
  async getDetailedComparison(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('v1', ParseIntPipe) version1: number,
    @Query('v2', ParseIntPipe) version2: number,
    @Query('format') format?: 'html' | 'unified' | 'json',
  ) {
    // This would need to fetch the actual content and compare
    // For now, returning a placeholder response
    return {
      message: 'Detailed comparison endpoint - implement with actual document content',
      documentId,
      version1,
      version2,
      format: format || 'json',
    };
  }

  @Get('changes')
  @ApiOperation({ summary: 'Get all changes for a document' })
  @ApiResponse({ status: 200, description: 'Changes retrieved successfully' })
  async getChanges(@Param('documentId', ParseUUIDPipe) documentId: string) {
    return await this.changeTrackingService.getDocumentChanges(documentId);
  }

  @Get('changes/summary')
  @ApiOperation({ summary: 'Get change summary for a document' })
  @ApiResponse({ status: 200, description: 'Change summary retrieved successfully' })
  async getChangeSummary(@Param('documentId', ParseUUIDPipe) documentId: string) {
    return await this.changeTrackingService.generateChangeSummary(documentId);
  }

  @Get('changes/recent')
  @ApiOperation({ summary: 'Get recent changes for a document' })
  @ApiResponse({ status: 200, description: 'Recent changes retrieved successfully' })
  async getRecentChanges(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return await this.changeTrackingService.getRecentChanges(documentId, limit || 10);
  }
}
