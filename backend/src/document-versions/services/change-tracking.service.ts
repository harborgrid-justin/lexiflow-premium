import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionChange } from '../entities/version-change.entity';
import { CreateVersionChangeDto } from '../dto/create-version-change.dto';

export enum ChangeType {
  CONTENT_MODIFIED = 'content_modified',
  METADATA_UPDATED = 'metadata_updated',
  FILE_REPLACED = 'file_replaced',
  SECTION_ADDED = 'section_added',
  SECTION_REMOVED = 'section_removed',
  FORMATTING_CHANGED = 'formatting_changed',
}

@Injectable()
export class ChangeTrackingService {
  private readonly logger = new Logger(ChangeTrackingService.name);

  constructor(
    @InjectRepository(VersionChange)
    private changeRepository: Repository<VersionChange>,
  ) {}

  /**
   * Record a change between two versions
   */
  async recordChange(
    documentId: string,
    fromVersion: number,
    toVersion: number,
    changeType: ChangeType,
    details: Record<string, any>,
    userId?: string,
  ): Promise<VersionChange> {
    try {
      const change = this.changeRepository.create({
        documentId,
        fromVersion,
        toVersion,
        changeType,
        changeDetails: details,
        changedBy: userId,
      });

      const savedChange = await this.changeRepository.save(change);
      this.logger.log(
        `Change recorded for document ${documentId}: v${fromVersion} -> v${toVersion}`,
      );

      return savedChange;
    } catch (error) {
      this.logger.error('Failed to record change', error);
      throw error;
    }
  }

  /**
   * Get all changes for a document
   */
  async getDocumentChanges(documentId: string): Promise<VersionChange[]> {
    return await this.changeRepository.find({
      where: { documentId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get changes between two specific versions
   */
  async getChangesBetweenVersions(
    documentId: string,
    fromVersion: number,
    toVersion: number,
  ): Promise<VersionChange[]> {
    const query = this.changeRepository.createQueryBuilder('change');

    query.where('change.documentId = :documentId', { documentId });
    query.andWhere('change.fromVersion >= :fromVersion', { fromVersion });
    query.andWhere('change.toVersion <= :toVersion', { toVersion });
    query.orderBy('change.timestamp', 'ASC');

    return await query.getMany();
  }

  /**
   * Get changes by type
   */
  async getChangesByType(
    documentId: string,
    changeType: ChangeType,
  ): Promise<VersionChange[]> {
    return await this.changeRepository.find({
      where: { documentId, changeType },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get recent changes
   */
  async getRecentChanges(
    documentId: string,
    limit: number = 10,
  ): Promise<VersionChange[]> {
    return await this.changeRepository.find({
      where: { documentId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get changes made by a specific user
   */
  async getChangesByUser(
    documentId: string,
    userId: string,
  ): Promise<VersionChange[]> {
    return await this.changeRepository.find({
      where: { documentId, changedBy: userId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Generate change summary
   */
  async generateChangeSummary(documentId: string): Promise<{
    totalChanges: number;
    changesByType: Record<string, number>;
    recentChanges: VersionChange[];
    contributors: string[];
  }> {
    const allChanges = await this.getDocumentChanges(documentId);

    const changesByType: Record<string, number> = {};
    const contributorsSet = new Set<string>();

    allChanges.forEach((change) => {
      // Count by type
      const type = change.changeType;
      changesByType[type] = (changesByType[type] || 0) + 1;

      // Track contributors
      if (change.changedBy) {
        contributorsSet.add(change.changedBy);
      }
    });

    const recentChanges = allChanges.slice(0, 10);

    return {
      totalChanges: allChanges.length,
      changesByType,
      recentChanges,
      contributors: Array.from(contributorsSet),
    };
  }

  /**
   * Track metadata change
   */
  async trackMetadataChange(
    documentId: string,
    version: number,
    field: string,
    oldValue: any,
    newValue: any,
    userId?: string,
  ): Promise<VersionChange> {
    return await this.recordChange(
      documentId,
      version - 1,
      version,
      ChangeType.METADATA_UPDATED,
      {
        field,
        oldValue,
        newValue,
      },
      userId,
    );
  }

  /**
   * Track content change
   */
  async trackContentChange(
    documentId: string,
    fromVersion: number,
    toVersion: number,
    changeDetails: {
      linesAdded: number;
      linesRemoved: number;
      wordsAdded: number;
      wordsRemoved: number;
    },
    userId?: string,
  ): Promise<VersionChange> {
    return await this.recordChange(
      documentId,
      fromVersion,
      toVersion,
      ChangeType.CONTENT_MODIFIED,
      changeDetails,
      userId,
    );
  }

  /**
   * Delete changes for a document (cleanup)
   */
  async deleteDocumentChanges(documentId: string): Promise<void> {
    await this.changeRepository.delete({ documentId });
    this.logger.log(`All changes deleted for document ${documentId}`);
  }
}
