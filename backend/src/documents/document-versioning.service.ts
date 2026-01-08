import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVersion } from './entities/document-version.entity';
import { Document } from './entities/document.entity';
import * as crypto from 'crypto';

/**
 * Document Versioning Service
 *
 * Manages complete version history with:
 * - Automatic version creation on document updates
 * - Content hash verification
 * - Change tracking and diff generation
 * - Version rollback capabilities
 * - Semantic versioning support
 */
@Injectable()
export class DocumentVersioningService {
  private readonly logger = new Logger(DocumentVersioningService.name);

  constructor(
    @InjectRepository(DocumentVersion)
    private versionRepository: Repository<DocumentVersion>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  /**
   * Create a new version of a document
   */
  async createVersion(
    documentId: string,
    authorId: string,
    options: {
      content?: string;
      filePath?: string;
      fileSize?: number;
      mimeType?: string;
      commitMessage?: string;
      versionType?: 'major' | 'minor' | 'patch' | 'auto';
      changes?: {
        added?: string[];
        removed?: string[];
        modified?: string[];
        summary?: string;
      };
    },
  ): Promise<DocumentVersion> {
    this.logger.log(`Creating version for document ${documentId}`);

    // Get the document
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    // Get the latest version number
    const latestVersion = await this.versionRepository.findOne({
      where: { documentId },
      order: { versionNumber: 'DESC' },
    });

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Calculate content hash
    const contentHash = this.calculateHash(
      options.content || options.filePath || documentId,
    );

    // Get document metadata snapshot
    const metadata = {
      title: document.title,
      description: document.description,
      tags: document.tags,
      customFields: document.customFields,
    };

    // Create version
    const version = this.versionRepository.create({
      documentId,
      versionNumber: nextVersionNumber,
      versionTag: this.generateVersionTag(nextVersionNumber, options.versionType),
      contentHash,
      content: options.content,
      filePath: options.filePath,
      fileSize: options.fileSize,
      mimeType: options.mimeType,
      changes: options.changes,
      metadata,
      authorId,
      commitMessage: options.commitMessage,
      versionType: options.versionType || 'auto',
      previousVersionId: latestVersion?.id,
      status: 'completed',
    });

    const savedVersion = await this.versionRepository.save(version);

    // Update document's current version
    document.currentVersion = nextVersionNumber;
    await this.documentRepository.save(document);

    this.logger.log(
      `Created version ${nextVersionNumber} for document ${documentId}`,
    );

    return savedVersion;
  }

  /**
   * Get version history for a document
   */
  async getVersionHistory(
    documentId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeContent?: boolean;
    },
  ): Promise<DocumentVersion[]> {
    const query = this.versionRepository
      .createQueryBuilder('version')
      .where('version.documentId = :documentId', { documentId })
      .orderBy('version.versionNumber', 'DESC')
      .leftJoinAndSelect('version.author', 'author');

    if (!options?.includeContent) {
      query.select([
        'version.id',
        'version.documentId',
        'version.versionNumber',
        'version.versionTag',
        'version.contentHash',
        'version.fileSize',
        'version.mimeType',
        'version.changes',
        'version.authorId',
        'version.commitMessage',
        'version.versionType',
        'version.isPublished',
        'version.publishedAt',
        'version.createdAt',
        'author.id',
        'author.email',
        'author.firstName',
        'author.lastName',
      ]);
    }

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    return query.getMany();
  }

  /**
   * Get a specific version
   */
  async getVersion(versionId: string): Promise<DocumentVersion> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
      relations: ['author', 'document'],
    });

    if (!version) {
      throw new NotFoundException(`Version ${versionId} not found`);
    }

    return version;
  }

  /**
   * Get version by document ID and version number
   */
  async getVersionByNumber(
    documentId: string,
    versionNumber: number,
  ): Promise<DocumentVersion> {
    const version = await this.versionRepository.findOne({
      where: { documentId, versionNumber },
      relations: ['author'],
    });

    if (!version) {
      throw new NotFoundException(
        `Version ${versionNumber} not found for document ${documentId}`,
      );
    }

    return version;
  }

  /**
   * Rollback document to a specific version
   */
  async rollbackToVersion(
    documentId: string,
    versionNumber: number,
    authorId: string,
    commitMessage?: string,
  ): Promise<DocumentVersion> {
    this.logger.log(
      `Rolling back document ${documentId} to version ${versionNumber}`,
    );

    // Get the target version
    const targetVersion = await this.getVersionByNumber(
      documentId,
      versionNumber,
    );

    // Create a new version with the target version's content
    return this.createVersion(documentId, authorId, {
      content: targetVersion.content,
      filePath: targetVersion.filePath,
      fileSize: targetVersion.fileSize,
      mimeType: targetVersion.mimeType,
      commitMessage:
        commitMessage || `Rollback to version ${versionNumber}`,
      versionType: 'major',
      changes: {
        summary: `Rolled back to version ${versionNumber}`,
      },
    });
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    versionId1: string,
    versionId2: string,
  ): Promise<{
    version1: DocumentVersion;
    version2: DocumentVersion;
    differences: {
      contentChanged: boolean;
      metadataChanged: boolean;
      sizeChange: number;
      hashMatch: boolean;
    };
  }> {
    const [version1, version2] = await Promise.all([
      this.getVersion(versionId1),
      this.getVersion(versionId2),
    ]);

    const differences = {
      contentChanged: version1.contentHash !== version2.contentHash,
      metadataChanged:
        JSON.stringify(version1.metadata) !== JSON.stringify(version2.metadata),
      sizeChange: (version2.fileSize || 0) - (version1.fileSize || 0),
      hashMatch: version1.contentHash === version2.contentHash,
    };

    return {
      version1,
      version2,
      differences,
    };
  }

  /**
   * Publish a version
   */
  async publishVersion(versionId: string): Promise<DocumentVersion> {
    const version = await this.getVersion(versionId);

    version.isPublished = true;
    version.publishedAt = new Date();

    return this.versionRepository.save(version);
  }

  /**
   * Get latest published version
   */
  async getLatestPublishedVersion(
    documentId: string,
  ): Promise<DocumentVersion | null> {
    return this.versionRepository.findOne({
      where: {
        documentId,
        isPublished: true,
      },
      order: { versionNumber: 'DESC' },
      relations: ['author'],
    });
  }

  /**
   * Delete old versions (keep last N versions)
   */
  async pruneVersions(
    documentId: string,
    keepCount: number = 10,
  ): Promise<number> {
    this.logger.log(
      `Pruning versions for document ${documentId}, keeping ${keepCount}`,
    );

    const versions = await this.versionRepository.find({
      where: { documentId },
      order: { versionNumber: 'DESC' },
      select: ['id', 'versionNumber', 'isPublished'],
    });

    if (versions.length <= keepCount) {
      return 0;
    }

    // Keep published versions and the latest N versions
    const toKeep = new Set(
      versions
        .filter((v) => v.isPublished)
        .map((v) => v.id)
        .concat(versions.slice(0, keepCount).map((v) => v.id)),
    );

    const toDelete = versions
      .filter((v) => !toKeep.has(v.id))
      .map((v) => v.id);

    if (toDelete.length > 0) {
      await this.versionRepository.delete(toDelete);
    }

    this.logger.log(`Pruned ${toDelete.length} versions for document ${documentId}`);
    return toDelete.length;
  }

  /**
   * Get version statistics
   */
  async getVersionStats(documentId: string): Promise<{
    totalVersions: number;
    publishedVersions: number;
    totalSize: number;
    latestVersion: number;
    oldestVersion: Date;
    newestVersion: Date;
  }> {
    const versions = await this.versionRepository.find({
      where: { documentId },
      select: [
        'id',
        'versionNumber',
        'fileSize',
        'isPublished',
        'createdAt',
      ],
    });

    const totalSize = versions.reduce(
      (sum, v) => sum + (v.fileSize || 0),
      0,
    );

    return {
      totalVersions: versions.length,
      publishedVersions: versions.filter((v) => v.isPublished).length,
      totalSize,
      latestVersion: Math.max(...versions.map((v) => v.versionNumber), 0),
      oldestVersion: new Date(
        Math.min(...versions.map((v) => v.createdAt.getTime())),
      ),
      newestVersion: new Date(
        Math.max(...versions.map((v) => v.createdAt.getTime())),
      ),
    };
  }

  /**
   * Calculate SHA256 hash of content
   */
  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate semantic version tag
   */
  private generateVersionTag(
    versionNumber: number,
    versionType?: 'major' | 'minor' | 'patch' | 'auto',
  ): string {
    // Simple implementation - can be enhanced with semantic versioning logic
    const major = Math.floor(versionNumber / 100);
    const minor = Math.floor((versionNumber % 100) / 10);
    const patch = versionNumber % 10;
    return `${major}.${minor}.${patch}`;
  }
}
