import { Test, TestingModule } from '@nestjs/testing';
import { DocumentVersionsController } from './document-versions.controller';
import { DocumentVersionsService } from './document-versions.service';

describe('DocumentVersionsController', () => {
  let controller: DocumentVersionsController;
  let service: DocumentVersionsService;

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
  };

  const mockDocumentVersionsService = {
    findAll: jest.fn(),
    findByDocumentId: jest.fn(),
    findById: jest.fn(),
    createVersion: jest.fn(),
    getLatestVersion: jest.fn(),
    getVersionByNumber: jest.fn(),
    deleteVersion: jest.fn(),
    compareVersions: jest.fn(),
    restoreVersion: jest.fn(),
    getVersionHistory: jest.fn(),
    getVersionCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentVersionsController],
      providers: [{ provide: DocumentVersionsService, useValue: mockDocumentVersionsService }],
    }).compile();

    controller = module.get<DocumentVersionsController>(DocumentVersionsController);
    service = module.get<DocumentVersionsService>(DocumentVersionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all versions', async () => {
      mockDocumentVersionsService.findAll.mockResolvedValue([mockVersion]);

      const result = await controller.findAll();

      expect(result).toEqual([mockVersion]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByDocumentId', () => {
    it('should return versions for a document', async () => {
      mockDocumentVersionsService.findByDocumentId.mockResolvedValue([mockVersion]);

      const result = await controller.findByDocumentId('doc-001');

      expect(result).toEqual([mockVersion]);
      expect(service.findByDocumentId).toHaveBeenCalledWith('doc-001');
    });
  });

  describe('findById', () => {
    it('should return a version by id', async () => {
      mockDocumentVersionsService.findById.mockResolvedValue(mockVersion);

      const result = await controller.findById('version-001');

      expect(result).toEqual(mockVersion);
      expect(service.findById).toHaveBeenCalledWith('version-001');
    });
  });

  describe('getLatestVersion', () => {
    it('should return the latest version', async () => {
      mockDocumentVersionsService.getLatestVersion.mockResolvedValue(mockVersion);

      const result = await controller.getLatestVersion('doc-001');

      expect(result).toEqual(mockVersion);
      expect(service.getLatestVersion).toHaveBeenCalledWith('doc-001');
    });
  });

  describe('getVersionByNumber', () => {
    it('should return a specific version number', async () => {
      mockDocumentVersionsService.getVersionByNumber.mockResolvedValue(mockVersion);

      const result = await controller.getVersionByNumber('doc-001', 1);

      expect(result).toEqual(mockVersion);
      expect(service.getVersionByNumber).toHaveBeenCalledWith('doc-001', 1);
    });
  });

  describe('deleteVersion', () => {
    it('should delete a version', async () => {
      mockDocumentVersionsService.deleteVersion.mockResolvedValue(undefined);

      await controller.deleteVersion('version-001');

      expect(service.deleteVersion).toHaveBeenCalledWith('version-001');
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', async () => {
      mockDocumentVersionsService.compareVersions.mockResolvedValue({
        version1: mockVersion,
        version2: { ...mockVersion, versionNumber: 2 },
        sizeDiff: 10000,
      });

      const result = await controller.compareVersions('version-001', 'version-002');

      expect(result).toHaveProperty('version1');
      expect(result).toHaveProperty('version2');
      expect(result).toHaveProperty('sizeDiff');
      expect(service.compareVersions).toHaveBeenCalledWith('version-001', 'version-002');
    });
  });

  describe('restoreVersion', () => {
    it('should restore an older version', async () => {
      mockDocumentVersionsService.restoreVersion.mockResolvedValue({
        ...mockVersion,
        versionNumber: 3,
        isLatest: true,
      });

      const result = await controller.restoreVersion('version-001', 'user-001');

      expect(result.isLatest).toBe(true);
      expect(service.restoreVersion).toHaveBeenCalledWith('version-001', 'user-001');
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history', async () => {
      mockDocumentVersionsService.getVersionHistory.mockResolvedValue([
        mockVersion,
        { ...mockVersion, versionNumber: 2 },
      ]);

      const result = await controller.getVersionHistory('doc-001');

      expect(result).toHaveLength(2);
      expect(service.getVersionHistory).toHaveBeenCalledWith('doc-001');
    });
  });

  describe('getVersionCount', () => {
    it('should return the number of versions', async () => {
      mockDocumentVersionsService.getVersionCount.mockResolvedValue(5);

      const result = await controller.getVersionCount('doc-001');

      expect(result).toBe(5);
      expect(service.getVersionCount).toHaveBeenCalledWith('doc-001');
    });
  });
});
