import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVersion } from './entities/document-version.entity';
import { CreateVersionDto } from './dto/create-version.dto';
import { FileStorageService } from '@file-storage/file-storage.service';

@Injectable()
export class DocumentVersionsService {
  private readonly logger = new Logger(DocumentVersionsService.name);

  constructor(
    @InjectRepository(DocumentVersion)
    private versionRepository: Repository<DocumentVersion>,
    private fileStorageService: FileStorageService,
  ) {}

  /**
   * Create a new version of a document
   */
  async createVersion(
    documentId: string,
    caseId: string,
    file: Express.Multer.File,
    createVersionDto: CreateVersionDto,
    userId?: string,
  ): Promise<DocumentVersion> {
    try {
      // Get the latest version number
      const latestVersion = await this.getLatestVersionNumber(documentId);
      const newVersionNumber = latestVersion + 1;

      // Store the file
      const fileResult = await this.fileStorageService.storeFile(
        file,
        caseId,
        documentId,
        newVersionNumber,
      );

      // Create version record
      const version = this.versionRepository.create({
        documentId,
        version: newVersionNumber,
        filename: fileResult.filename,
        filePath: fileResult.path,
        mimeType: fileResult.mimetype,
        fileSize: fileResult.size,
        checksum: fileResult.checksum,
        changeDescription: createVersionDto.changeDescription,
        metadata: createVersionDto.metadata,
        createdBy: userId,
      });

      const savedVersion = await this.versionRepository.save(version);
      this.logger.log(
        `Version ${newVersionNumber} created for document ${documentId}`,
      );

      return savedVersion;
    } catch (error) {
      this.logger.error('Failed to create version', error);
      throw error;
    }
  }

  /**
   * Get all versions of a document
   */
  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    return await this.versionRepository.find({
      where: { documentId },
      order: { version: 'DESC' },
    });
  }

  /**
   * Get a specific version
   */
  async getVersion(documentId: string, version: number): Promise<DocumentVersion> {
    const documentVersion = await this.versionRepository.findOne({
      where: { documentId, version },
    });

    if (!documentVersion) {
      throw new NotFoundException(
        `Version ${version} not found for document ${documentId}`,
      );
    }

    return documentVersion;
  }

  /**
   * Get the latest version number for a document
   */
  async getLatestVersionNumber(documentId: string): Promise<number> {
    const latestVersion = await this.versionRepository.findOne({
      where: { documentId },
      order: { version: 'DESC' },
    });

    return latestVersion ? latestVersion.version : 0;
  }

  /**
   * Restore a previous version of a document
   */
  async restoreVersion(documentId: string, versionNumber: number): Promise<DocumentVersion> {
    // Get the version to restore
    const versionToRestore = await this.versionRepository.findOne({
      where: { documentId, version: versionNumber },
    });

    if (!versionToRestore) {
      throw new NotFoundException(`Version ${versionNumber} not found for document ${documentId}`);
    }

    // Get latest version number
    const latestVersion = await this.getLatestVersionNumber(documentId);

    // Create new version from old content with proper description
    const restoredVersion = this.versionRepository.create({
      documentId: versionToRestore.documentId,
      version: latestVersion + 1,
      filename: versionToRestore.filename,
      filePath: versionToRestore.filePath,
      mimeType: versionToRestore.mimeType,
      fileSize: versionToRestore.fileSize,
      checksum: versionToRestore.checksum,
      changeDescription: `Restored from version ${versionNumber}`,
      createdBy: versionToRestore.createdBy,
      metadata: versionToRestore.metadata,
    });

    return this.versionRepository.save(restoredVersion);
  }

  /**
   * Download a specific version
   */
  async downloadVersion(
    documentId: string,
    version: number,
  ): Promise<{
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }> {
    const documentVersion = await this.getVersion(documentId, version);

    const buffer = await this.fileStorageService.getFile(documentVersion.filePath);

    return {
      buffer,
      filename: documentVersion.filename,
      mimeType: documentVersion.mimeType,
    };
  }

  /**
   * Compare two versions (returns metadata comparison)
   */
  async compareVersions(
    documentId: string,
    version1: number,
    version2: number,
  ): Promise<{
    version1: DocumentVersion;
    version2: DocumentVersion;
    differences: {
      fileSize: number;
      pageCount: number;
      wordCount: number;
      checksumMatch: boolean;
    };
  }> {
    const v1 = await this.getVersion(documentId, version1);
    const v2 = await this.getVersion(documentId, version2);

    return {
      version1: v1,
      version2: v2,
      differences: {
        fileSize: Number(v2.fileSize) - Number(v1.fileSize),
        pageCount: (v2.pageCount || 0) - (v1.pageCount || 0),
        wordCount: (v2.wordCount || 0) - (v1.wordCount || 0),
        checksumMatch: v1.checksum === v2.checksum,
      },
    };
  }

}
