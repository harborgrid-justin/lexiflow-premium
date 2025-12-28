import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import {
  DetectLanguageDto,
  ExtractStructuredDataOptionsDto,
  BatchProcessRequestDto,
} from './dto/ocr-request.dto';

@ApiTags('OCR')
@ApiBearerAuth('JWT-auth')

@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'ocr', timestamp: new Date().toISOString() };
  }

  @Get('languages')
  @ApiOperation({ summary: 'Get supported OCR languages' })
  @ApiResponse({ status: 200, description: 'List of supported languages' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSupportedLanguages() {
    return this.ocrService.getSupportedLanguages();
  }

  @Get('languages/:lang/check')
  @ApiOperation({ summary: 'Check if language is supported' })
  @ApiResponse({ status: 200, description: 'Language support status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'lang', description: 'Language code (e.g., eng, spa, fra)' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async checkLanguageSupport(@Param('lang') lang: string) {
    return this.ocrService.isLanguageSupported(lang);
  }

  @Get('progress/:jobId')
  @ApiOperation({ summary: 'Get OCR job progress' })
  @ApiResponse({ status: 200, description: 'Job progress status' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'jobId', description: 'OCR job ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getProgress(@Param('jobId') jobId: string) {
    return this.ocrService.getOcrProgress(jobId);
  }

  @Post('detect-language')
  @ApiOperation({ summary: 'Detect language from text or document' })
  @ApiResponse({ status: 200, description: 'Detected language' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async detectLanguage(@Body() body: DetectLanguageDto) {
    return this.ocrService.detectLanguage(body);
  }

  @Post('extract/:documentId')
  @ApiOperation({ summary: 'Extract structured data from document' })
  @ApiResponse({ status: 200, description: 'Extracted data' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async extractStructuredData(
    @Param('documentId') documentId: string,
    @Body() options: ExtractStructuredDataOptionsDto,
  ) {
    return this.ocrService.extractStructuredData(documentId, options);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Process multiple documents in batch' })
  @ApiResponse({ status: 201, description: 'Batch job created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async batchProcess(@Body() batchDto: BatchProcessRequestDto) {
    return this.ocrService.batchProcess(batchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get OCR processing statistics' })
  @ApiResponse({ status: 200, description: 'OCR statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOcrStats() {
    return this.ocrService.getOcrStats();
  }
}

