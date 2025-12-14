import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { FileStorageService } from '../file-storage/file-storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;
  let fileStorageService: FileStorageService;

  const mockDocument: Partial<Document> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Document',
    description: 'Test description',
    type: 'Brief',
    caseId: 'case-001',
    status: 'Draft',
    author: 'John Doe',
    tags: ['legal', 'brief'],
    filename: 'test.pdf',
    filePath: '/uploads/case-001/doc-001/1/test.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    checksum: 'abc123',
    currentVersion: 1,
    ocrProcessed: false,
    fullTextContent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockDocument], 1]),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockFileStorageService = {
    storeFile: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
        {
          provide: FileStorageService,
          useValue: mockFileStorageService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
    fileStorageService = module.get<FileStorageService>(FileStorageService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateDocumentDto = {
      title: 'New Document',
      description: 'New description',
      type: 'Motion',
      caseId: 'case-001',
      status: 'Draft',
    };

    it('should create a document without file', async () => {
      mockRepository.create.mockReturnValue({ ...mockDocument, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockDocument, ...createDto });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should create a document with file upload', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
        stream: null,
        destination: '',
        filename: 'test.pdf',
        path: '',
      };

      const fileResult = {
        filename: 'test.pdf',
        path: '/uploads/case-001/doc-001/1/test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        checksum: 'abc123',
      };

      mockFileStorageService.storeFile.mockResolvedValue(fileResult);
      mockRepository.create.mockReturnValue({ ...mockDocument, ...createDto });
      mockRepository.save.mockResolvedValue({
        ...mockDocument,
        ...createDto,
        ...fileResult,
      });

      const result = await service.create(createDto, mockFile, 'user-001');

      expect(mockFileStorageService.storeFile).toHaveBeenCalledWith(
        mockFile,
        createDto.caseId,
        expect.any(String),
        1,
      );
      expect(result).toHaveProperty('filename');
    });

    it('should set createdBy when userId is provided', async () => {
      mockRepository.create.mockReturnValue({ ...mockDocument, createdBy: 'user-001' });
      mockRepository.save.mockResolvedValue({ ...mockDocument, createdBy: 'user-001' });

      await service.create(createDto, undefined, 'user-001');

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 'user-001' }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated documents', async () => {
      const filterDto: DocumentFilterDto = { page: 1, limit: 20 };

      const result = await service.findAll(filterDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 20);
      expect(result).toHaveProperty('totalPages', 1);
    });

    it('should apply caseId filter', async () => {
      const filterDto: DocumentFilterDto = { caseId: 'case-001', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.caseId = :caseId',
        { caseId: 'case-001' },
      );
    });

    it('should apply type filter', async () => {
      const filterDto: DocumentFilterDto = { type: 'Brief', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.type = :type',
        { type: 'Brief' },
      );
    });

    it('should apply status filter', async () => {
      const filterDto: DocumentFilterDto = { status: 'Draft', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.status = :status',
        { status: 'Draft' },
      );
    });

    it('should apply search filter', async () => {
      const filterDto: DocumentFilterDto = { search: 'test', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(document.title ILIKE :search OR document.description ILIKE :search OR document.fullTextContent ILIKE :search)',
        { search: '%test%' },
      );
    });

    it('should apply author filter', async () => {
      const filterDto: DocumentFilterDto = { author: 'John', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.author ILIKE :author',
        { author: '%John%' },
      );
    });

    it('should apply tag filter', async () => {
      const filterDto: DocumentFilterDto = { tag: 'legal', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        ':tag = ANY(document.tags)',
        { tag: 'legal' },
      );
    });

    it('should apply date range filter', async () => {
      const filterDto: DocumentFilterDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        limit: 20,
      };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.createdAt BETWEEN :startDate AND :endDate',
        { startDate: '2024-01-01', endDate: '2024-12-31' },
      );
    });

    it('should apply sorting', async () => {
      const filterDto: DocumentFilterDto = {
        page: 1,
        limit: 20,
        sortBy: 'title',
        sortOrder: 'ASC',
      };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('document.title', 'ASC');
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne(mockDocument.id);

      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
      });
    });

    it('should throw NotFoundException if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateDocumentDto = {
      title: 'Updated Title',
      status: 'Final',
    };

    it('should update a document', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue({ ...mockDocument, ...updateDto });

      const result = await service.update(mockDocument.id, updateDto, 'user-001');

      expect(result).toHaveProperty('title', updateDto.title);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should set updatedBy when userId is provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue({ ...mockDocument, updatedBy: 'user-001' });

      const result = await service.update(mockDocument.id, updateDto, 'user-001');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ updatedBy: 'user-001' }),
      );
    });

    it('should throw NotFoundException if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a document and its file', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockFileStorageService.deleteFile.mockResolvedValue(undefined);
      mockRepository.remove.mockResolvedValue(mockDocument);

      await service.remove(mockDocument.id);

      expect(mockFileStorageService.deleteFile).toHaveBeenCalledWith(
        mockDocument.filePath,
      );
      expect(mockRepository.remove).toHaveBeenCalledWith(mockDocument);
    });

    it('should handle file deletion failure gracefully', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockFileStorageService.deleteFile.mockRejectedValue(new Error('File not found'));
      mockRepository.remove.mockResolvedValue(mockDocument);

      await service.remove(mockDocument.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockDocument);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('downloadFile', () => {
    it('should return file buffer and metadata', async () => {
      const fileBuffer = Buffer.from('file content');
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockFileStorageService.getFile.mockResolvedValue(fileBuffer);

      const result = await service.downloadFile(mockDocument.id);

      expect(result).toHaveProperty('buffer', fileBuffer);
      expect(result).toHaveProperty('filename', mockDocument.filename);
      expect(result).toHaveProperty('mimeType', mockDocument.mimeType);
    });

    it('should throw BadRequestException if document has no file', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockDocument, filePath: null });

      await expect(service.downloadFile(mockDocument.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.downloadFile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markOcrProcessed', () => {
    it('should mark document as OCR processed', async () => {
      const ocrContent = 'Extracted text content';
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue({
        ...mockDocument,
        ocrProcessed: true,
        fullTextContent: ocrContent,
      });

      const result = await service.markOcrProcessed(mockDocument.id, ocrContent);

      expect(result.ocrProcessed).toBe(true);
      expect(result.fullTextContent).toBe(ocrContent);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markOcrProcessed('non-existent-id', 'content'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCaseId', () => {
    it('should return documents for a case', async () => {
      mockRepository.find.mockResolvedValue([mockDocument]);

      const result = await service.findByCaseId('case-001');

      expect(result).toEqual([mockDocument]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('searchFullText', () => {
    it('should search documents by full text', async () => {
      mockRepository.find.mockResolvedValue([mockDocument]);

      const result = await service.searchFullText('search term');

      expect(result).toEqual([mockDocument]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { fullTextContent: expect.any(Object) },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
