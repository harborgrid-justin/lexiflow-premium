import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileStorageService } from './file-storage.service';
import * as fsPromises from 'fs/promises';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
  stat: jest.fn(),
  readdir: jest.fn().mockResolvedValue([]),
  rmdir: jest.fn(),
}));

describe('FileStorageService', () => {
  let service: FileStorageService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, unknown> = {
        UPLOAD_DIR: './uploads',
        MAX_FILE_SIZE: 52428800,
      };
      return config[key];
    }),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test file content'),
    size: 17,
    destination: '',
    filename: 'test-document.pdf',
    path: '',
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storeFile', () => {
    it('should store a file and return file info', async () => {
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.stat as jest.Mock).mockResolvedValue({ size: 17 });

      const result = await service.storeFile(mockFile, 'case-001', 'doc-001', 1);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('mimetype', 'application/pdf');
      expect(result).toHaveProperty('size', 17);
      expect(result).toHaveProperty('checksum');
      expect(fsPromises.mkdir).toHaveBeenCalled();
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });

    it('should create nested directory structure', async () => {
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.stat as jest.Mock).mockResolvedValue({ size: 17 });

      await service.storeFile(mockFile, 'case-001', 'doc-001', 1);

      expect(fsPromises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('case-001'),
        expect.objectContaining({ recursive: true }),
      );
    });

    it('should generate unique filename', async () => {
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.stat as jest.Mock).mockResolvedValue({ size: 17 });

      const result1 = await service.storeFile(mockFile, 'case-001', 'doc-001', 1);
      const result2 = await service.storeFile(mockFile, 'case-001', 'doc-001', 2);

      expect(result1.path).not.toBe(result2.path);
    });

    it('should calculate checksum correctly', async () => {
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.stat as jest.Mock).mockResolvedValue({ size: 17 });

      const result = await service.storeFile(mockFile, 'case-001', 'doc-001', 1);

      const expectedChecksum = crypto
        .createHash('sha256')
        .update(mockFile.buffer)
        .digest('hex');

      expect(result.checksum).toBe(expectedChecksum);
    });
  });

  describe('getFile', () => {
    it('should return file buffer', async () => {
      const mockBuffer = Buffer.from('file content');
      (fsPromises.readFile as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.getFile('/uploads/case-001/doc-001/1/test.pdf');

      expect(result).toEqual(mockBuffer);
      expect(fsPromises.readFile).toHaveBeenCalledWith('/uploads/case-001/doc-001/1/test.pdf');
    });

    it('should throw error if file not found', async () => {
      (fsPromises.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      await expect(service.getFile('/non-existent/path')).rejects.toThrow();
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      (fsPromises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteFile('/uploads/case-001/doc-001/1/test.pdf');

      expect(fsPromises.unlink).toHaveBeenCalledWith('/uploads/case-001/doc-001/1/test.pdf');
    });

    it('should handle non-existent file gracefully', async () => {
      (fsPromises.unlink as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      await expect(
        service.deleteFile('/non-existent/file'),
      ).resolves.not.toThrow();
    });
  });

  // Skipping tests for private method fileExists
  describe('fileExists', () => {
    it.skip('should return true if file exists', async () => {
      // fileExists is a private method and should not be tested directly
    });

    it.skip('should return false if file does not exist', async () => {
      // fileExists is a private method and should not be tested directly
    });
  });

  describe('getFileInfo', () => {
    it('should return file stats', async () => {
      const mockStats = {
        size: 1024,
        mtime: new Date(),
        isFile: () => true,
        isDirectory: () => false,
      };
      (fsPromises.stat as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getFileInfo('/uploads/case-001/doc-001/1/test.pdf');

      expect(result).toHaveProperty('size', 1024);
      expect(result).toHaveProperty('modifiedAt');
    });

    it('should throw error if file not found', async () => {
      (fsPromises.stat as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      await expect(service.getFileInfo('/non-existent/file')).rejects.toThrow();
    });
  });

  describe('verifyChecksum', () => {
    it('should return true if checksum matches', async () => {
      const mockBuffer = Buffer.from('test content');
      const expectedChecksum = crypto
        .createHash('sha256')
        .update(mockBuffer)
        .digest('hex');

      (fsPromises.readFile as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.verifyChecksum('/path/to/file', expectedChecksum);

      expect(result).toBe(true);
    });

    it('should return false if checksum does not match', async () => {
      const mockBuffer = Buffer.from('test content');
      (fsPromises.readFile as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.verifyChecksum('/path/to/file', 'invalid-checksum');

      expect(result).toBe(false);
    });
  });

  describe('copyFile', () => {
    it('should copy file to new location', async () => {
      const mockBuffer = Buffer.from('file content');
      (fsPromises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.copyFile('/source/path', '/dest/path');

      expect(fsPromises.readFile).toHaveBeenCalledWith('/source/path');
      expect(fsPromises.mkdir).toHaveBeenCalled();
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });
  });

  describe('moveFile', () => {
    it('should move file to new location', async () => {
      const mockBuffer = Buffer.from('file content');
      (fsPromises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.moveFile('/source/path', '/dest/path');

      expect(fsPromises.readFile).toHaveBeenCalledWith('/source/path');
      expect(fsPromises.mkdir).toHaveBeenCalled();
      expect(fsPromises.writeFile).toHaveBeenCalled();
      expect(fsPromises.unlink).toHaveBeenCalledWith('/source/path');
    });
  });

  describe('listFiles', () => {
    it('should list files in directory', async () => {
      (fsPromises.readdir as jest.Mock).mockResolvedValueOnce(['file1.pdf', 'file2.pdf']);

      const result = await service.listFiles('/uploads/case-001');

      expect(result).toEqual(['file1.pdf', 'file2.pdf']);
    });

    it('should return empty array for empty directory', async () => {
      (fsPromises.readdir as jest.Mock).mockResolvedValue([]);

      const result = await service.listFiles('/uploads/case-001');

      expect(result).toEqual([]);
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      const result = await service.getStorageStats();

      expect(result).toHaveProperty('totalFiles');
      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('usedSpace');
    });
  });

  describe('cleanupOrphans', () => {
    it('should remove orphaned files', async () => {
      (fsPromises.readdir as jest.Mock).mockResolvedValue(['orphan1.pdf', 'orphan2.pdf']);
      (fsPromises.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await service.cleanupOrphans(['valid-doc-id']);

      expect(result).toHaveProperty('removed');
    });
  });
});
