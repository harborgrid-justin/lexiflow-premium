import { Test, TestingModule } from '@nestjs/testing';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';

describe('OcrController', () => {
  let controller: OcrController;
  let service: OcrService;

  const mockOcrResult = {
    text: 'Extracted text from document',
    confidence: 0.95,
    pages: [{ pageNumber: 1, text: 'Page 1 content', confidence: 0.96 }],
  };

  const mockOcrService = {
    processDocument: jest.fn(),
    extractText: jest.fn(),
    extractTextFromPdf: jest.fn(),
    getSupportedLanguages: jest.fn(),
    isLanguageSupported: jest.fn(),
    getOcrProgress: jest.fn(),
    detectLanguage: jest.fn(),
    preprocessImage: jest.fn(),
    extractStructuredData: jest.fn(),
    batchProcess: jest.fn(),
    getOcrStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcrController],
      providers: [{ provide: OcrService, useValue: mockOcrService }],
    }).compile();

    controller = module.get<OcrController>(OcrController);
    service = module.get<OcrService>(OcrService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('processDocument', () => {
    it('should process a document and extract text', async () => {
      mockOcrService.processDocument.mockResolvedValue(mockOcrResult);

      const result = await controller.processDocument('doc-001', { languages: ['eng'] });

      expect(result).toEqual(mockOcrResult);
      expect(service.processDocument).toHaveBeenCalledWith('doc-001', { languages: ['eng'] });
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return supported languages', async () => {
      mockOcrService.getSupportedLanguages.mockResolvedValue(['eng', 'spa', 'fra', 'deu']);

      const result = await controller.getSupportedLanguages();

      expect(result).toContain('eng');
      expect(service.getSupportedLanguages).toHaveBeenCalled();
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported language', async () => {
      mockOcrService.isLanguageSupported.mockResolvedValue(true);

      const result = await controller.isLanguageSupported('eng');

      expect(result).toBe(true);
      expect(service.isLanguageSupported).toHaveBeenCalledWith('eng');
    });
  });

  describe('getOcrProgress', () => {
    it('should return OCR job progress', async () => {
      mockOcrService.getOcrProgress.mockResolvedValue({
        progress: 75,
        status: 'processing',
        currentPage: 3,
        totalPages: 4,
      });

      const result = await controller.getOcrProgress('job-001');

      expect(result).toHaveProperty('progress', 75);
      expect(service.getOcrProgress).toHaveBeenCalledWith('job-001');
    });
  });

  describe('detectLanguage', () => {
    it('should detect language from text', async () => {
      mockOcrService.detectLanguage.mockResolvedValue({
        language: 'eng',
        confidence: 0.98,
      });

      const result = await controller.detectLanguage({ text: 'This is English text.' });

      expect(result).toHaveProperty('language', 'eng');
      expect(service.detectLanguage).toHaveBeenCalled();
    });
  });

  describe('extractStructuredData', () => {
    it('should extract structured data from document', async () => {
      mockOcrService.extractStructuredData.mockResolvedValue({
        fields: { name: 'John Doe', date: '2024-01-15' },
      });

      const result = await controller.extractStructuredData('doc-001', {
        fields: ['name', 'date'],
      });

      expect(result).toHaveProperty('fields');
      expect(service.extractStructuredData).toHaveBeenCalled();
    });
  });

  describe('batchProcess', () => {
    it('should process multiple documents', async () => {
      mockOcrService.batchProcess.mockResolvedValue([
        { documentId: 'doc-001', success: true, text: 'Text 1' },
        { documentId: 'doc-002', success: true, text: 'Text 2' },
      ]);

      const result = await controller.batchProcess({
        documentIds: ['doc-001', 'doc-002'],
        options: { languages: ['eng'] },
      });

      expect(result).toHaveLength(2);
      expect(service.batchProcess).toHaveBeenCalled();
    });
  });

  describe('getOcrStats', () => {
    it('should return OCR statistics', async () => {
      mockOcrService.getOcrStats.mockResolvedValue({
        totalProcessed: 1000,
        averageConfidence: 0.92,
        processingTime: { avg: 5.2, min: 1.0, max: 30.0 },
      });

      const result = await controller.getOcrStats();

      expect(result).toHaveProperty('totalProcessed');
      expect(result).toHaveProperty('averageConfidence');
      expect(service.getOcrStats).toHaveBeenCalled();
    });
  });
});
