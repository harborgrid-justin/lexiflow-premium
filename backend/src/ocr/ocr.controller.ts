import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OcrService } from './ocr.service';

@ApiTags('OCR')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Get('languages')
  async getSupportedLanguages() {
    return this.ocrService.getSupportedLanguages();
  }

  @Get('languages/:lang/check')
  async checkLanguageSupport(@Param('lang') lang: string) {
    return this.ocrService.isLanguageSupported(lang);
  }

  @Get('progress/:jobId')
  async getProgress(@Param('jobId') jobId: string) {
    return this.ocrService.getOcrProgress(jobId);
  }

  @Post('detect-language')
  async detectLanguage(@Body() body: any) {
    return this.ocrService.detectLanguage(body);
  }

  @Post('extract/:documentId')
  async extractStructuredData(@Param('documentId') documentId: string, @Body() options: any) {
    return this.ocrService.extractStructuredData(documentId, options);
  }

  @Post('batch')
  async batchProcess(@Body() batchDto: any) {
    return this.ocrService.batchProcess(batchDto);
  }

  @Get('stats')
  async getOcrStats() {
    return this.ocrService.getOcrStats();
  }
}
