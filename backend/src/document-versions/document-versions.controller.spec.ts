import { Test, TestingModule } from '@nestjs/testing';
import { DocumentVersionsController } from './document-versions.controller';
import { DocumentVersionsService } from './document-versions.service';

describe('DocumentVersionsController', () => {
  let controller: DocumentVersionsController;
  let service: DocumentVersionsService;

  const mockVersion = {
    id: 'version-001',
    documentId: 'doc-001',
    version: 1,
    filePath: '/path/to/file',
    createdAt: new Date(),
    createdBy: 'user-001',
  };

  const mockDocumentVersionsService = {
    createVersion: jest.fn(),
    getVersionHistory: jest.fn(),
    getVersion: jest.fn(),
    downloadVersion: jest.fn(),
    compareVersions: jest.fn(),
    restoreVersion: jest.fn(),
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

  describe('getVersionHistory', () => {
    it('should return version history for a document', async () => {
      (mockDocumentVersionsService.getVersionHistory as jest.Mock).mockResolvedValue([mockVersion]);

      const result = await controller.getVersionHistory('doc-001');

      expect(result).toEqual([mockVersion]);
      expect(service.getVersionHistory).toHaveBeenCalledWith('doc-001');
    });
  });

  describe('getVersion', () => {
    it('should return a specific version', async () => {
      (mockDocumentVersionsService.getVersion as jest.Mock).mockResolvedValue(mockVersion);

      const result = await controller.getVersion('doc-001', 1);

      expect(result).toEqual(mockVersion);
      expect(service.getVersion).toHaveBeenCalledWith('doc-001', 1);
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', async () => {
      const comparison = { changes: [], v1: 1, v2: 2 };
      (mockDocumentVersionsService.compareVersions as jest.Mock).mockResolvedValue(comparison);

      const result = await controller.compareVersions('doc-001', 1, 2);

      expect(result).toEqual(comparison);
      expect(service.compareVersions).toHaveBeenCalledWith('doc-001', 1, 2);
    });
  });

  describe('restoreVersion', () => {
    it('should restore a version', async () => {
      (mockDocumentVersionsService.restoreVersion as jest.Mock).mockResolvedValue(mockVersion);

      const result = await controller.restoreVersion('doc-001', 1);

      expect(result).toEqual(mockVersion);
      expect(service.restoreVersion).toHaveBeenCalledWith('doc-001', 1);
    });
  });
});
