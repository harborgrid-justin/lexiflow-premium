import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentVersionsService } from './document-versions.service';
import { DocumentVersion } from './entities/document-version.entity';

describe('DocumentVersionsService', () => {
  let service: DocumentVersionsService;
  let repository: Repository<DocumentVersion>;

  const mockVersion = {
    id: 'version-001',
    documentId: 'doc-001',
    versionNumber: 1,
    filename: 'contract_v1.pdf',
    filePath: '/uploads/case-001/doc-001/1/contract_v1.pdf',
    fileSize: 102400,
    mimeType: 'application/pdf',
    checksum: 'abc123',
    changes: 'Initial version',
    createdBy: 'user-001',
    createdAt: new Date(),
    isLatest: true,
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentVersionsService,
        { provide: getRepositoryToken(DocumentVersion), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DocumentVersionsService>(DocumentVersionsService);
    repository = module.get<Repository<DocumentVersion>>(getRepositoryToken(DocumentVersion));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all versions', async () => {
      mockRepository.find.mockResolvedValue([mockVersion]);

      const result = await service.findAll();

      expect(result).toEqual([mockVersion]);
    });
  });

  describe('findByDocumentId', () => {
    it('should return versions for a document', async () => {
      mockRepository.find.mockResolvedValue([mockVersion]);

      const result = await service.findByDocumentId('doc-001');

      expect(result).toEqual([mockVersion]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { documentId: 'doc-001' },
        order: { versionNumber: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should return a version by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockVersion);

      const result = await service.findById(mockVersion.id);

      expect(result).toEqual(mockVersion);
    });

    it('should throw NotFoundException if version not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createVersion', () => {
    it('should create a new version', async () => {
      const createDto = {
        documentId: 'doc-001',
        filename: 'contract_v2.pdf',
        filePath: '/uploads/case-001/doc-001/2/contract_v2.pdf',
        fileSize: 110000,
        mimeType: 'application/pdf',
        checksum: 'def456',
        changes: 'Updated terms section',
      };

      mockRepository.count.mockResolvedValue(1);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.create.mockReturnValue({ ...mockVersion, ...createDto, versionNumber: 2 });
      mockRepository.save.mockResolvedValue({ ...mockVersion, ...createDto, versionNumber: 2 });

      const result = await service.createVersion(createDto, 'user-001');

      expect(result).toHaveProperty('versionNumber', 2);
      expect(result).toHaveProperty('changes', createDto.changes);
    });

    it('should mark previous version as not latest', async () => {
      mockRepository.count.mockResolvedValue(1);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.create.mockReturnValue({ ...mockVersion, versionNumber: 2 });
      mockRepository.save.mockResolvedValue({ ...mockVersion, versionNumber: 2 });

      await service.createVersion({
        documentId: 'doc-001',
        filename: 'file.pdf',
        filePath: '/path',
        fileSize: 1000,
        mimeType: 'application/pdf',
        checksum: 'xyz',
      }, 'user-001');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { documentId: 'doc-001', isLatest: true },
        { isLatest: false },
      );
    });
  });

  describe('getLatestVersion', () => {
    it('should return the latest version', async () => {
      mockRepository.findOne.mockResolvedValue(mockVersion);

      const result = await service.getLatestVersion('doc-001');

      expect(result).toEqual(mockVersion);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { documentId: 'doc-001', isLatest: true },
      });
    });

    it('should return null if no versions exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getLatestVersion('doc-001');

      expect(result).toBeNull();
    });
  });

  describe('getVersionByNumber', () => {
    it('should return a specific version number', async () => {
      mockRepository.findOne.mockResolvedValue(mockVersion);

      const result = await service.getVersionByNumber('doc-001', 1);

      expect(result).toEqual(mockVersion);
    });

    it('should throw NotFoundException if version not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getVersionByNumber('doc-001', 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteVersion', () => {
    it('should delete a version', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockVersion, isLatest: false });
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteVersion(mockVersion.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockVersion.id);
    });

    it('should throw BadRequestException when deleting latest version', async () => {
      mockRepository.findOne.mockResolvedValue(mockVersion);

      await expect(service.deleteVersion(mockVersion.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('compareVersions', () => {
    it('should return comparison between two versions', async () => {
      const version1 = { ...mockVersion, versionNumber: 1, fileSize: 100000 };
      const version2 = { ...mockVersion, id: 'version-002', versionNumber: 2, fileSize: 110000 };

      mockRepository.findOne
        .mockResolvedValueOnce(version1)
        .mockResolvedValueOnce(version2);

      const result = await service.compareVersions('version-001', 'version-002');

      expect(result).toHaveProperty('version1');
      expect(result).toHaveProperty('version2');
      expect(result).toHaveProperty('sizeDiff');
    });
  });

  describe('restoreVersion', () => {
    it('should restore an older version as the latest', async () => {
      const oldVersion = { ...mockVersion, versionNumber: 1, isLatest: false };
      mockRepository.findOne.mockResolvedValue(oldVersion);
      mockRepository.count.mockResolvedValue(2);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.create.mockReturnValue({ ...oldVersion, versionNumber: 3, isLatest: true });
      mockRepository.save.mockResolvedValue({ ...oldVersion, versionNumber: 3, isLatest: true });

      const result = await service.restoreVersion('version-001', 'user-001');

      expect(result.versionNumber).toBe(3);
      expect(result.isLatest).toBe(true);
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history with metadata', async () => {
      const versions = [
        { ...mockVersion, versionNumber: 2 },
        { ...mockVersion, id: 'version-002', versionNumber: 1 },
      ];
      mockRepository.find.mockResolvedValue(versions);

      const result = await service.getVersionHistory('doc-001');

      expect(result).toHaveLength(2);
      expect(result[0].versionNumber).toBe(2);
    });
  });

  describe('getVersionCount', () => {
    it('should return the number of versions', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.getVersionCount('doc-001');

      expect(result).toBe(5);
    });
  });
});
