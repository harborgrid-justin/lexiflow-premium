import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileStorageService } from './file-storage.service';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    stat: jest.fn(),
    readdir: jest.fn(),
    rmdir: jest.fn(),
  },
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
}));

describe('FileStorageService', () => {
  let service: FileStorageService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
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
    stream: null as any,
    destination: '',
    filename: 'test-document.pdf',
    path: '',
  };

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
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.storeFile(mockFile, 'case-001', 'doc-001', 1);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('mimetype', 'application/pdf');
      expect(result).toHaveProperty('size', 17);
      expect(result).toHaveProperty('checksum');
      expect(fs.promises.mkdir).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should create nested directory structure', async () => {
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.storeFile(mockFile, 'case-001', 'doc-001', 1);

      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('case-001'),
        expect.objectContaining({ recursive: true }),
      );
    });

    it('should generate unique filename', async () => {
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result1 = await service.storeFile(mockFile, 'case-001', 'doc-001', 1);
      const result2 = await service.storeFile(mockFile, 'case-001', 'doc-001', 2);

      expect(result1.path).not.toBe(result2.path);
    });

    it('should calculate checksum correctly', async () => {
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

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
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.getFile('/uploads/case-001/doc-001/1/test.pdf');

      expect(result).toEqual(mockBuffer);
      expect(fs.promises.readFile).toHaveBeenCalledWith('/uploads/case-001/doc-001/1/test.pdf');
    });

    it('should throw error if file not found', async () => {
      (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      await expect(service.getFile('/non-existent/path')).rejects.toThrow();
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteFile('/uploads/case-001/doc-001/1/test.pdf');

      expect(fs.promises.unlink).toHaveBeenCalledWith('/uploads/case-001/doc-001/1/test.pdf');
    });

    it('should handle non-existent file gracefully', async () => {
      (fs.promises.unlink as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      await expect(
        service.deleteFile('/non-existent/file'),
      ).resolves.not.toThrow();
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.fileExists('/uploads/case-001/doc-001/1/test.pdf');

      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await service.fileExists('/non-existent/file');

      expect(result).toBe(false);
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
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getFileInfo('/uploads/case-001/doc-001/1/test.pdf');

      expect(result).toHaveProperty('size', 1024);
      expect(result).toHaveProperty('modifiedAt');
    });

    it('should throw error if file not found', async () => {
      (fs.promises.stat as jest.Mock).mockRejectedValue(new Error('ENOENT'));

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

      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.verifyChecksum('/path/to/file', expectedChecksum);

      expect(result).toBe(true);
    });

    it('should return false if checksum does not match', async () => {
      const mockBuffer = Buffer.from('test content');
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.verifyChecksum('/path/to/file', 'invalid-checksum');

      expect(result).toBe(false);
    });
  });

  describe('copyFile', () => {
    it('should copy file to new location', async () => {
      const mockBuffer = Buffer.from('file content');
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.copyFile('/source/path', '/dest/path');

      expect(fs.promises.readFile).toHaveBeenCalledWith('/source/path');
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });
  });

  describe('moveFile', () => {
    it('should move file to new location', async () => {
      const mockBuffer = Buffer.from('file content');
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.moveFile('/source/path', '/dest/path');

      expect(fs.promises.readFile).toHaveBeenCalledWith('/source/path');
      expect(fs.promises.writeFile).toHaveBeenCalled();
      expect(fs.promises.unlink).toHaveBeenCalledWith('/source/path');
    });
  });

  describe('listFiles', () => {
    it('should list files in directory', async () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['file1.pdf', 'file2.pdf']);

      const result = await service.listFiles('/uploads/case-001');

      expect(result).toEqual(['file1.pdf', 'file2.pdf']);
    });

    it('should return empty array for empty directory', async () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValue([]);

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
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['orphan1.pdf', 'orphan2.pdf']);
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await service.cleanupOrphans(['valid-doc-id']);

      expect(result).toHaveProperty('removed');
    });
  });
});
