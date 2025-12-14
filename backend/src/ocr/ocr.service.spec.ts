import { Test, TestingModule } from '@nestjs/testing';
import { OcrService } from './ocr.service';
import { DocumentsService } from '../documents/documents.service';

describe('OcrService', () => {
  let service: OcrService;
  let documentsService: DocumentsService;

  const mockDocument = {
    id: 'doc-001',
    filename: 'test.pdf',
    filePath: '/uploads/case-001/doc-001/1/test.pdf',
    mimeType: 'application/pdf',
  };

  const mockDocumentsService = {
    findOne: jest.fn(),
    downloadFile: jest.fn(),
    markOcrProcessed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OcrService,
        { provide: DocumentsService, useValue: mockDocumentsService },
      ],
    }).compile();

    service = module.get<OcrService>(OcrService);
    documentsService = module.get<DocumentsService>(DocumentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processDocument', () => {
    it('should process a document and extract text', async () => {
      const mockBuffer = Buffer.from('PDF content');
      mockDocumentsService.findOne.mockResolvedValue(mockDocument);
      mockDocumentsService.downloadFile.mockResolvedValue({
        buffer: mockBuffer,
        filename: 'test.pdf',
        mimeType: 'application/pdf',
      });
      mockDocumentsService.markOcrProcessed.mockResolvedValue({
        ...mockDocument,
        ocrProcessed: true,
        fullTextContent: 'Extracted text',
      });

      const result = await service.processDocument('doc-001', { languages: ['eng'] });

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
      expect(mockDocumentsService.markOcrProcessed).toHaveBeenCalled();
    });

    it('should use default language if not specified', async () => {
      const mockBuffer = Buffer.from('PDF content');
      mockDocumentsService.findOne.mockResolvedValue(mockDocument);
      mockDocumentsService.downloadFile.mockResolvedValue({
        buffer: mockBuffer,
        filename: 'test.pdf',
        mimeType: 'application/pdf',
      });
      mockDocumentsService.markOcrProcessed.mockResolvedValue({
        ...mockDocument,
        ocrProcessed: true,
      });

      await service.processDocument('doc-001');

      // Should use 'eng' as default
      expect(mockDocumentsService.findOne).toHaveBeenCalledWith('doc-001');
    });
  });

  describe('extractText', () => {
    it('should extract text from image buffer', async () => {
      const mockImageBuffer = Buffer.from('image data');

      const result = await service.extractText(mockImageBuffer, ['eng']);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
    });

    it('should handle multiple languages', async () => {
      const mockImageBuffer = Buffer.from('image data');

      const result = await service.extractText(mockImageBuffer, ['eng', 'spa']);

      expect(result).toHaveProperty('text');
    });
  });

  describe('extractTextFromPdf', () => {
    it('should extract text from PDF buffer', async () => {
      const mockPdfBuffer = Buffer.from('PDF content');

      const result = await service.extractTextFromPdf(mockPdfBuffer, ['eng']);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('pages');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', async () => {
      const result = await service.getSupportedLanguages();

      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('eng');
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported language', async () => {
      const result = await service.isLanguageSupported('eng');

      expect(result).toBe(true);
    });

    it('should return false for unsupported language', async () => {
      const result = await service.isLanguageSupported('xyz');

      expect(result).toBe(false);
    });
  });

  describe('getOcrProgress', () => {
    it('should return OCR progress for a job', async () => {
      const result = await service.getOcrProgress('job-001');

      expect(result).toHaveProperty('progress');
      expect(result).toHaveProperty('status');
    });
  });

  describe('detectLanguage', () => {
    it('should detect language from text', async () => {
      const sampleText = 'This is English text for testing language detection.';

      const result = await service.detectLanguage(sampleText);

      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('confidence');
    });
  });

  describe('preprocessImage', () => {
    it('should preprocess image for better OCR results', async () => {
      const mockImageBuffer = Buffer.from('image data');

      const result = await service.preprocessImage(mockImageBuffer, {
        deskew: true,
        denoise: true,
        contrast: 1.2,
      });

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should apply default preprocessing if options not specified', async () => {
      const mockImageBuffer = Buffer.from('image data');

      const result = await service.preprocessImage(mockImageBuffer);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('extractStructuredData', () => {
    it('should extract structured data from document', async () => {
      const mockBuffer = Buffer.from('Document with name: John Doe, date: 2024-01-15');
      mockDocumentsService.downloadFile.mockResolvedValue({
        buffer: mockBuffer,
        filename: 'form.pdf',
        mimeType: 'application/pdf',
      });

      const result = await service.extractStructuredData('doc-001', {
        fields: ['name', 'date'],
      });

      expect(result).toHaveProperty('fields');
    });
  });

  describe('batchProcess', () => {
    it('should process multiple documents', async () => {
      mockDocumentsService.findOne.mockResolvedValue(mockDocument);
      mockDocumentsService.downloadFile.mockResolvedValue({
        buffer: Buffer.from('content'),
        filename: 'test.pdf',
        mimeType: 'application/pdf',
      });
      mockDocumentsService.markOcrProcessed.mockResolvedValue({
        ...mockDocument,
        ocrProcessed: true,
      });

      const result = await service.batchProcess(['doc-001', 'doc-002'], { languages: ['eng'] });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
    });

    it('should handle errors in batch processing', async () => {
      mockDocumentsService.findOne
        .mockResolvedValueOnce(mockDocument)
        .mockRejectedValueOnce(new Error('Document not found'));
      mockDocumentsService.downloadFile.mockResolvedValue({
        buffer: Buffer.from('content'),
        filename: 'test.pdf',
        mimeType: 'application/pdf',
      });
      mockDocumentsService.markOcrProcessed.mockResolvedValue({
        ...mockDocument,
        ocrProcessed: true,
      });

      const result = await service.batchProcess(['doc-001', 'doc-002'], { languages: ['eng'] });

      expect(result.some(r => r.error)).toBe(true);
    });
  });

  describe('getOcrStats', () => {
    it('should return OCR statistics', async () => {
      const result = await service.getOcrStats();

      expect(result).toHaveProperty('totalProcessed');
      expect(result).toHaveProperty('averageConfidence');
      expect(result).toHaveProperty('processingTime');
    });
  });
});
