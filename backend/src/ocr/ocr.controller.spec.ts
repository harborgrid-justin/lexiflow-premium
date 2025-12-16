import { Test, TestingModule } from '@nestjs/testing';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { describe, expect, jest } from '@jest/globals';

describe('OcrController', () => {
  let controller: OcrController;
  let service: OcrService;

  const mockOcrService = {
    getSupportedLanguages: jest.fn(),
    isLanguageSupported: jest.fn(),
    getOcrProgress: jest.fn(),
    detectLanguage: jest.fn(),
    extractStructuredData: jest.fn(),
    batchProcess: jest.fn(),
    getOcrStats: jest.fn(),
  } as any;

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

  describe('getSupportedLanguages', () => {
    it('should return supported languages', async () => {
      const languages = ['eng', 'spa', 'fra'];
      (mockOcrService.getSupportedLanguages as jest.Mock).mockResolvedValue(languages as any);

      const result = await controller.getSupportedLanguages();

      expect(result).toEqual(languages);
      expect(service.getSupportedLanguages).toHaveBeenCalled();
    });
  });

  describe('checkLanguageSupport', () => {
    it('should check if a language is supported', async () => {
      (mockOcrService.isLanguageSupported as jest.Mock).mockResolvedValue({ supported: true, language: 'eng' } as any);

      const result = await controller.checkLanguageSupport('eng');

      expect(result).toHaveProperty('supported', true);
      expect(service.isLanguageSupported).toHaveBeenCalledWith('eng');
    });
  });

  describe('getProgress', () => {
    it('should return OCR progress for a job', async () => {
      const progress = { jobId: 'job-001', progress: 50, status: 'processing' };
      (mockOcrService.getOcrProgress as jest.Mock).mockResolvedValue(progress);

      const result = await controller.getProgress('job-001');

      expect(result).toEqual(progress);
      expect(service.getOcrProgress).toHaveBeenCalledWith('job-001');
    });
  });
});
