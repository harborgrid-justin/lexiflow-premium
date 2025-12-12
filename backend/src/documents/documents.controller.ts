import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { ProcessingJobsService } from '../processing-jobs/processing-jobs.service';
import { JobType } from '../processing-jobs/dto/job-status.dto';
import { OcrRequestDto } from '../ocr/dto/ocr-request.dto';
import { DocumentTemplateService } from './services/document-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { GenerateFromTemplateDto } from './dto/generate-from-template.dto';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('api/v1/documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    @Inject(ProcessingJobsService)
    private readonly processingJobsService: ProcessingJobsService,
    private readonly templateService: DocumentTemplateService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a new document',
    description: 'Upload and create a new document with file attachment. Supports various document types including PDF, Word, Excel, images, etc.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Motion to Dismiss' },
        description: { type: 'string', example: 'Motion to dismiss the complaint' },
        type: { type: 'string', example: 'motion', enum: ['pleading', 'motion', 'discovery', 'contract', 'evidence', 'correspondence', 'other'] },
        caseId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
        status: { type: 'string', example: 'draft', enum: ['draft', 'review', 'approved', 'filed', 'executed'] },
        author: { type: 'string', example: 'John Doe' },
        tags: { type: 'array', items: { type: 'string' }, example: ['urgent', 'confidential'] },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'type', 'caseId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.documentsService.create(createDocumentDto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'List all documents with filtering and pagination',
    description: 'Retrieve a paginated list of documents with optional filters for case, type, status, date range, and full-text search'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case UUID' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by document type' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Full-text search query' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO 8601)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt', description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC', description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() filterDto: DocumentFilterDto) {
    return await this.documentsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get document metadata by ID',
    description: 'Retrieve detailed metadata for a specific document including versions, tags, and processing status'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.documentsService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download document file',
    description: 'Download the actual file content of a document. Returns the file with appropriate content-type and filename headers.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully', content: { 'application/octet-stream': {} } })
  @ApiResponse({ status: 404, description: 'Document or file not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Full update of document metadata',
    description: 'Replace all document metadata fields. Does not affect the document file itself.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Document UUID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return await this.documentsService.update(id, updateDocumentDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partial update of document metadata',
    description: 'Update specific fields of document metadata without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Document UUID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: Partial<UpdateDocumentDto>,
  ) {
    return await this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a document',
    description: 'Soft delete a document. The document is marked as deleted but not removed from the database.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Document UUID' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.documentsService.remove(id);
  }

  @Post('bulk/delete')
  @ApiOperation({
    summary: 'Bulk delete documents',
    description: 'Delete multiple documents at once by providing an array of document IDs'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string', format: 'uuid' }, example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'] }
      },
      required: ['ids']
    }
  })
  @ApiResponse({ status: 200, description: 'Documents deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkDelete(@Body('ids') ids: string[]) {
    return await this.documentsService.bulkDelete(ids);
  }

  @Post(':id/ocr')
  @ApiOperation({
    summary: 'Trigger OCR processing for a document',
    description: 'Start optical character recognition (OCR) processing to extract text from scanned documents or images'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Document UUID' })
  @ApiBody({ type: OcrRequestDto })
  @ApiResponse({ status: 201, description: 'OCR job created successfully', schema: {
    example: {
      message: 'OCR processing job created',
      jobId: '323e4567-e89b-12d3-a456-426614174002',
      documentId: '123e4567-e89b-12d3-a456-426614174000'
    }
  }})
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async triggerOcr(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() ocrRequestDto: OcrRequestDto,
  ) {
    // Verify document exists
    const document = await this.documentsService.findOne(id);

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
  @ApiOperation({
    summary: 'Create redaction job for a document',
    description: 'Start a redaction processing job to automatically or manually redact sensitive information from documents'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Document UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        redactionType: { type: 'string', enum: ['automatic', 'manual'], example: 'automatic' },
        patterns: { type: 'array', items: { type: 'string' }, example: ['SSN', 'email', 'phone'] },
        customPatterns: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Redaction job created successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async createRedaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() redactionParams: any,
  ) {
    // Verify document exists
    const document = await this.documentsService.findOne(id);

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

  @Post('search')
  @ApiOperation({
    summary: 'Advanced document search',
    description: 'Perform advanced full-text search across document content, metadata, and OCR text'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', example: 'contract agreement' },
        filters: {
          type: 'object',
          properties: {
            caseId: { type: 'string', format: 'uuid' },
            types: { type: 'array', items: { type: 'string' } },
            dateFrom: { type: 'string', format: 'date' },
            dateTo: { type: 'string', format: 'date' }
          }
        },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 }
      },
      required: ['query']
    }
  })
  @ApiResponse({ status: 200, description: 'Search results returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async advancedSearch(@Body() searchDto: any) {
    return await this.documentsService.advancedSearch(searchDto);
  }
}

@ApiTags('document-templates')
@ApiBearerAuth()
@Controller('api/v1/document-templates')
export class DocumentTemplatesController {
  constructor(private readonly templateService: DocumentTemplateService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new document template',
    description: 'Create a reusable document template with variables for dynamic content generation'
  })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template syntax or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    return await this.templateService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all document templates',
    description: 'Retrieve all document templates with optional filtering by category and active status'
  })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by template category' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('category') category?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return await this.templateService.findAll(category, isActive);
  }

  @Get('most-used')
  @ApiOperation({
    summary: 'Get most frequently used templates',
    description: 'Retrieve templates ordered by usage count for quick access to popular templates'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of templates to return' })
  @ApiResponse({ status: 200, description: 'Most used templates retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMostUsed(@Query('limit') limit?: number) {
    return await this.templateService.getMostUsed(limit || 10);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get template by ID',
    description: 'Retrieve detailed information about a specific document template'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.templateService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a template',
    description: 'Update template content, variables, or metadata'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Template UUID' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return await this.templateService.update(id, updateTemplateDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partial update of template',
    description: 'Update specific fields of a template without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Template UUID' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: Partial<UpdateTemplateDto>,
  ) {
    return await this.templateService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a template',
    description: 'Permanently delete a document template'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Template UUID' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.templateService.remove(id);
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Generate document from template',
    description: 'Create a new document by filling a template with provided variable values'
  })
  @ApiBody({ type: GenerateFromTemplateDto })
  @ApiResponse({ status: 201, description: 'Document generated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 400, description: 'Invalid variables or template error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async generateDocument(@Body() generateDto: GenerateFromTemplateDto) {
    const content = await this.templateService.generateFromTemplate(
      generateDto.templateId,
      generateDto.variables,
    );
    return { content };
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate template syntax',
    description: 'Check template syntax and variable definitions for errors before saving'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'Dear {{clientName}}, ...' }
      },
      required: ['content']
    }
  })
  @ApiResponse({ status: 200, description: 'Template validated successfully', schema: {
    example: { valid: true, variables: ['clientName'], errors: [] }
  }})
  @ApiResponse({ status: 400, description: 'Template validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validateTemplate(@Body() body: { content: string }) {
    return await this.templateService.validateTemplate(body.content);
  }
}
