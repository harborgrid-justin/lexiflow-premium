import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth , ApiResponse} from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { ProcessingJobsService } from '../processing-jobs/processing-jobs.service';
import { JobType } from '../processing-jobs/dto/job-status.dto';
import { OcrRequestDto } from '../ocr/dto/ocr-request.dto';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    @Inject(ProcessingJobsService)
    private readonly processingJobsService: ProcessingJobsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string' },
        caseId: { type: 'string' },
        status: { type: 'string' },
        author: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'type', 'caseId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.documentsService.create(createDocumentDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'List all documents with filtering' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() filterDto: DocumentFilterDto) {
    return await this.documentsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.documentsService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async downloadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename, mimeType } = await this.documentsService.downloadFile(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return await this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.documentsService.remove(id);
  }

  @Post(':id/ocr')
  @ApiOperation({ summary: 'Trigger OCR processing for a document' })
  @ApiResponse({ status: 201, description: 'OCR job created' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async triggerOcr(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() ocrRequestDto: OcrRequestDto,
  ) {
    // Verify document exists
    await this.documentsService.findOne(id);

    // Create OCR processing job
    const job = await this.processingJobsService.createJob(
      JobType.OCR,
      id,
      { languages: ocrRequestDto.languages || ['eng'] },
    );

    return {
      message: 'OCR processing job created',
      jobId: job.id,
      documentId: id,
    };
  }

  @Post(':id/redact')
  @ApiOperation({ summary: 'Create redaction job for a document' })
  @ApiResponse({ status: 201, description: 'Redaction job created' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createRedaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() redactionParams: any,
  ) {
    // Verify document exists
    await this.documentsService.findOne(id);

    // Create redaction processing job
    const job = await this.processingJobsService.createJob(
      JobType.REDACTION,
      id,
      redactionParams,
    );

    return {
      message: 'Redaction job created',
      jobId: job.id,
      documentId: id,
    };
  }

  @Get('folders/list')
  @ApiOperation({ summary: 'Get document folder structure' })
  @ApiResponse({ status: 200, description: 'Folders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getFolders() {
    return await this.documentsService.getFolders();
  }

  @Get(':id/content')
  @ApiOperation({ summary: 'Get document text content' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getContent(@Param('id', ParseUUIDPipe) id: string) {
    return await this.documentsService.getContent(id);
  }
}

