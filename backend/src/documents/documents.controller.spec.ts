import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { DocumentsController } from './documents.controller';

type MulterFile = Express.Multer.File;
import { DocumentsService } from './documents.service';
import { ProcessingJobsService } from '../processing-jobs/processing-jobs.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { JobType } from '../processing-jobs/dto/job-status.dto';
import { DocumentType, DocumentStatus } from './interfaces/document.interface';
import { describe, expect, jest, it, beforeEach } from '@jest/globals';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let documentsService: DocumentsService;
  let processingJobsService: ProcessingJobsService;

  const mockDocument = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Document',
    description: 'Test description',
    type: 'Brief',
    caseId: 'case-001',
    status: 'Draft',
    author: 'John Doe',
    filename: 'test.pdf',
    filePath: '/uploads/case-001/doc-001/1/test.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
  };

  const mockPaginatedResponse = {
    data: [mockDocument],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  const mockJob = {
    id: 'job-001',
    type: JobType.OCR,
    status: 'pending',
  };

  const mockDocumentsService = {
    create: jest.fn().mockResolvedValue(mockDocument),
    findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
    findOne: jest.fn().mockResolvedValue(mockDocument),
    update: jest.fn().mockResolvedValue(mockDocument),
    remove: jest.fn().mockResolvedValue(undefined),
    downloadFile: jest.fn().mockResolvedValue({
      buffer: Buffer.from('file content'),
      filename: 'test.pdf',
      mimeType: 'application/pdf',
    }),
  };

  const mockProcessingJobsService = {
    createJob: jest.fn().mockResolvedValue(mockJob),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        { provide: DocumentsService, useValue: mockDocumentsService },
        { provide: ProcessingJobsService, useValue: mockProcessingJobsService },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    documentsService = module.get<DocumentsService>(DocumentsService);
    processingJobsService = module.get<ProcessingJobsService>(ProcessingJobsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a document without file', async () => {
      const createDto: CreateDocumentDto = {
        title: 'New Document',
        type: DocumentType.MOTION,
        caseId: 'case-001',
      };

      const result = await controller.create(createDto);

      expect(result).toEqual(mockDocument);
      expect(documentsService.create).toHaveBeenCalledWith(createDto, undefined);
    });

    it('should create a document with file', async () => {
      const createDto: CreateDocumentDto = {
        title: 'New Document',
        type: DocumentType.MOTION,
        caseId: 'case-001',
      };

      const mockFile: File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
        destination: '',
        filename: 'test.pdf',
        path: '',
        stream: undefined as any,
      } as File;

      const result = await controller.create(createDto, mockFile);

      expect(result).toEqual(mockDocument);
      expect(documentsService.create).toHaveBeenCalledWith(createDto, mockFile);
    });
  });

  describe('findAll', () => {
    it('should return paginated documents', async () => {
      const filterDto: DocumentFilterDto = { page: 1, limit: 20 };

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(documentsService.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('should pass filter parameters', async () => {
      const filterDto: DocumentFilterDto = {
        caseId: 'case-001',
        type: DocumentType.BRIEF,
        status: DocumentStatus.DRAFT,
        page: 1,
        limit: 10,
      };

      await controller.findAll(filterDto);

      expect(documentsService.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      const result = await controller.findOne(mockDocument.id);

      expect(result).toEqual(mockDocument);
      expect(documentsService.findOne).toHaveBeenCalledWith(mockDocument.id);
    });
  });

  describe('downloadFile', () => {
    it('should download file and set response headers', async () => {
      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.downloadFile(mockDocument.id, mockResponse);

      expect(documentsService.downloadFile).toHaveBeenCalledWith(mockDocument.id);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
        'Content-Length': expect.any(Number),
      });
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const updateDto: UpdateDocumentDto = {
        title: 'Updated Title',
        status: DocumentStatus.APPROVED,
      };

      const result = await controller.update(mockDocument.id, updateDto);

      expect(result).toEqual(mockDocument);
      expect(documentsService.update).toHaveBeenCalledWith(mockDocument.id, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      const result = await controller.remove(mockDocument.id);

      expect(result).toEqual({ message: 'Document deleted successfully' });
      expect(documentsService.remove).toHaveBeenCalledWith(mockDocument.id);
    });
  });

  describe('triggerOcr', () => {
    it('should create OCR processing job', async () => {
      const ocrRequestDto = { documentId: mockDocument.id, languages: ['eng', 'spa'] };

      const result = await controller.triggerOcr(mockDocument.id, ocrRequestDto);

      expect(result).toHaveProperty('message', 'OCR processing job created');
      expect(result).toHaveProperty('jobId', mockJob.id);
      expect(result).toHaveProperty('documentId', mockDocument.id);
      expect(documentsService.findOne).toHaveBeenCalledWith(mockDocument.id);
      expect(processingJobsService.createJob).toHaveBeenCalledWith(
        JobType.OCR,
        mockDocument.id,
        { languages: ['eng', 'spa'] },
      );
    });

    it('should use default language if not provided', async () => {
      const ocrRequestDto = { documentId: mockDocument.id };

      await controller.triggerOcr(mockDocument.id, ocrRequestDto);

      expect(processingJobsService.createJob).toHaveBeenCalledWith(
        JobType.OCR,
        mockDocument.id,
        { languages: ['eng'] },
      );
    });
  });

  describe('createRedaction', () => {
    it('should create redaction processing job', async () => {
      const redactionParams = {
        patterns: ['SSN', 'Phone'],
        regions: [{ x: 100, y: 100, width: 200, height: 50 }],
      };

      mockProcessingJobsService.createJob.mockResolvedValueOnce({
        ...mockJob,
        type: JobType.REDACTION,
      });

      const result = await controller.createRedaction(mockDocument.id, redactionParams);

      expect(result).toHaveProperty('message', 'Redaction job created');
      expect(result).toHaveProperty('jobId');
      expect(result).toHaveProperty('documentId', mockDocument.id);
      expect(processingJobsService.createJob).toHaveBeenCalledWith(
        JobType.REDACTION,
        mockDocument.id,
        redactionParams,
      );
    });
  });
});
