import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('OCR')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get supported OCR languages' })
  @ApiResponse({ status: 200, description: 'List of supported languages' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSupportedLanguages() {
    return this.ocrService.getSupportedLanguages();
  }

  @Get('languages/:lang/check')
  @ApiOperation({ summary: 'Check if language is supported' })
  @ApiResponse({ status: 200, description: 'Language support status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'lang', description: 'Language code (e.g., eng, spa, fra)' })
  async checkLanguageSupport(@Param('lang') lang: string) {
    return this.ocrService.isLanguageSupported(lang);
  }

  @Get('progress/:jobId')
  @ApiOperation({ summary: 'Get OCR job progress' })
  @ApiResponse({ status: 200, description: 'Job progress status' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'jobId', description: 'OCR job ID' })
  async getProgress(@Param('jobId') jobId: string) {
    return this.ocrService.getOcrProgress(jobId);
  }

  @Post('detect-language')
  @ApiOperation({ summary: 'Detect language from text or document' })
  @ApiResponse({ status: 200, description: 'Detected language' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async detectLanguage(@Body() body: any) {
    return this.ocrService.detectLanguage(body);
  }

  @Post('extract/:documentId')
  @ApiOperation({ summary: 'Extract structured data from document' })
  @ApiResponse({ status: 200, description: 'Extracted data' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  async extractStructuredData(@Param('documentId') documentId: string, @Body() options: any) {
    return this.ocrService.extractStructuredData(documentId, options);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Process multiple documents in batch' })
  @ApiResponse({ status: 201, description: 'Batch job created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async batchProcess(@Body() batchDto: any) {
    return this.ocrService.batchProcess(batchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get OCR processing statistics' })
  @ApiResponse({ status: 200, description: 'OCR statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOcrStats() {
    return this.ocrService.getOcrStats();
  }
}
