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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentVersionsService } from './document-versions.service';
import { CreateVersionDto } from './dto/create-version.dto';

@ApiTags('Document Versions')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/documents/:documentId/versions')
export class DocumentVersionsController {
  constructor(
    private readonly documentVersionsService: DocumentVersionsService,
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
    @Res() res: any,
  ): Promise<void> {
    const { buffer, filename, mimeType } =
      await this.documentVersionsService.downloadVersion(documentId, version);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

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
  ) {
    return await this.documentVersionsService.restoreVersion(
      documentId,
      version,
    );
  }
}
