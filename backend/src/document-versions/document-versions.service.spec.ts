import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DocumentVersionsService } from './document-versions.service';
import { DocumentVersion } from './entities/document-version.entity';
import { FileStorageService } from '@file-storage/file-storage.service';
import { describe, expect, it, jest } from '@jest/globals';

describe('DocumentVersionsService', () => {
  let service: DocumentVersionsService;
  let repository: Repository<DocumentVersion>;
  let fileStorageService: FileStorageService;

  const mockVersion = {
    id: 'version-001',
    documentId: 'doc-001',
    version: 1,
    filename: 'contract_v1.pdf',
    filePath: '/uploads/case-001/doc-001/1/contract_v1.pdf',
    fileSize: 102400,
    mimeType: 'application/pdf',
    checksum: 'abc123',
    changeDescription: 'Initial version',
    createdBy: 'user-001',
    createdAt: new Date(),
    metadata: {},
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  } as any;

  const mockFileStorageService = {
    storeFile: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentVersionsService,
        { provide: getRepositoryToken(DocumentVersion), useValue: mockRepository },
        { provide: FileStorageService, useValue: mockFileStorageService },
      ],
    }).compile();

    service = module.get<DocumentVersionsService>(DocumentVersionsService);
    repository = module.get<Repository<DocumentVersion>>(getRepositoryToken(DocumentVersion));
    fileStorageService = module.get<FileStorageService>(FileStorageService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVersion', () => {
    it('should create a new version', async () => {
      const createDto = {
        changeDescription: 'Updated content',
        metadata: {},
      };
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
      } as any;

      (mockRepository.findOne as jest.Mock).mockResolvedValue(null as any);
      mockRepository.create.mockReturnValue(mockVersion as any);
      (mockRepository.save as jest.Mock).mockResolvedValue(mockVersion as any);
      (mockFileStorageService.storeFile as jest.Mock).mockResolvedValue({
        filename: 'test.pdf',
        path: '/uploads/test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        checksum: 'abc123',
      } as any);

      const result = await service.createVersion('doc-001', 'case-001', mockFile, createDto, 'user-001');

      expect(result).toEqual(mockVersion);
      expect(mockFileStorageService.storeFile).toHaveBeenCalled();
    });
  });

  describe('getVersionHistory', () => {
    it('should return all versions for a document', async () => {
      (mockRepository.find as jest.Mock).mockResolvedValue([mockVersion] as any);

      const result = await service.getVersionHistory('doc-001');

      expect(result).toEqual([mockVersion]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { documentId: 'doc-001' },
        order: { version: 'DESC' },
      });
    });
  });

  describe('getVersion', () => {
    it('should return a specific version', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockVersion as any);

      const result = await service.getVersion('doc-001', 1);

      expect(result).toEqual(mockVersion);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { documentId: 'doc-001', version: 1 },
      });
    });

    it('should throw NotFoundException if version not found', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null as any);

      await expect(service.getVersion('doc-001', 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLatestVersionNumber', () => {
    it('should return latest version number', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockVersion as any);

      const result = await service.getLatestVersionNumber('doc-001');

      expect(result).toBe(1);
    });

    it('should return 0 if no versions exist', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null as any);

      const result = await service.getLatestVersionNumber('doc-001');

      expect(result).toBe(0);
    });
  });

  describe('downloadVersion', () => {
    it('should download a specific version', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockVersion as any);
      (mockFileStorageService.getFile as jest.Mock).mockResolvedValue(Buffer.from('test') as any);

      const result = await service.downloadVersion('doc-001', 1);

      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('filename', 'contract_v1.pdf');
      expect(result).toHaveProperty('mimeType', 'application/pdf');
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', async () => {
      const version2 = { ...mockVersion, id: 'version-002', version: 2, fileSize: 110000 };
      mockRepository.findOne.mockResolvedValueOnce(mockVersion);
      mockRepository.findOne.mockResolvedValueOnce(version2);

      const result = await service.compareVersions('doc-001', 1, 2);

      expect(result).toHaveProperty('version1');
      expect(result).toHaveProperty('version2');
      expect(result).toHaveProperty('differences');
      expect(result.differences.fileSize).toBe(7600);
    });
  });

  describe('restoreVersion', () => {
    it('should restore a previous version', async () => {
      const restoredVersion = { ...mockVersion, version: 2 };
      mockRepository.findOne.mockResolvedValueOnce(mockVersion);
      mockRepository.findOne.mockResolvedValueOnce({ ...mockVersion, version: 1 });
      const restoredVersionWithDescription = {
        ...restoredVersion,
        changeDescription: 'Restored from version 1',
      };
      mockRepository.create.mockReturnValue(restoredVersionWithDescription as any);
      (mockRepository.save as jest.Mock).mockResolvedValue(restoredVersionWithDescription as any);
      (mockFileStorageService.getFile as jest.Mock).mockResolvedValue(Buffer.from('test') as any);

      const result = await service.restoreVersion('doc-001', 1);

      expect(result.version).toBe(2);
      expect(result.changeDescription).toContain('Restored from version 1');
    });
  });
});
