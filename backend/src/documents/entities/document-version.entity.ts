import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Document } from './document.entity';
import { User } from '@users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DocumentVersion Entity
 * Tracks complete version history of documents with content snapshots
 *
 * Features:
 * - Full content versioning with hash verification
 * - Change tracking with before/after metadata
 * - Author and timestamp audit trail
 * - Version tagging (major.minor.patch)
 * - Rollback capability
 */
@Entity('document_versions')
@Index(['documentId', 'versionNumber'])
@Index(['documentId', 'createdAt'])
@Index(['contentHash'])
export class DocumentVersion extends BaseEntity {
  @ApiProperty({ description: 'Reference to parent document' })
  @Column({ name: 'document_id', type: 'uuid' })
  @Index()
  documentId!: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @ApiProperty({ example: 1, description: 'Sequential version number' })
  @Column({ name: 'version_number', type: 'int' })
  versionNumber!: number;

  @ApiProperty({ example: '1.0.0', description: 'Semantic version tag' })
  @Column({ name: 'version_tag', nullable: true })
  versionTag?: string;

  @ApiProperty({ description: 'SHA256 hash of document content' })
  @Column({ name: 'content_hash' })
  contentHash!: string;

  @ApiProperty({ description: 'Full document content snapshot' })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @ApiProperty({ description: 'Path to versioned file in storage' })
  @Column({ name: 'file_path', nullable: true })
  filePath?: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @ApiProperty({ description: 'MIME type of versioned file' })
  @Column({ name: 'mime_type', nullable: true })
  mimeType?: string;

  @ApiProperty({ description: 'Changes made in this version' })
  @Column({ type: 'jsonb', nullable: true })
  changes?: {
    added?: string[];
    removed?: string[];
    modified?: string[];
    summary?: string;
    linesAdded?: number;
    linesRemoved?: number;
    linesModified?: number;
  };

  @ApiProperty({ description: 'Metadata snapshot at version time' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    customFields?: Record<string, unknown>;
  };

  @ApiProperty({ description: 'Version author/creator' })
  @Column({ name: 'author_id', type: 'uuid' })
  @Index()
  authorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ApiProperty({ description: 'Commit message for this version' })
  @Column({ name: 'commit_message', type: 'text', nullable: true })
  commitMessage?: string;

  @ApiProperty({ description: 'Version type (major, minor, patch, auto)' })
  @Column({ name: 'version_type', default: 'auto' })
  versionType!: 'major' | 'minor' | 'patch' | 'auto';

  @ApiProperty({ description: 'Whether this is a published/released version' })
  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @ApiProperty({ description: 'Published timestamp' })
  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @ApiProperty({ description: 'Previous version ID for tracking' })
  @Column({ name: 'previous_version_id', type: 'uuid', nullable: true })
  previousVersionId?: string;

  @ManyToOne(() => DocumentVersion, { nullable: true })
  @JoinColumn({ name: 'previous_version_id' })
  previousVersion?: DocumentVersion;

  @ApiProperty({ description: 'Size of changes in bytes' })
  @Column({ name: 'change_size', type: 'bigint', nullable: true })
  changeSize?: number;

  @ApiProperty({ description: 'Processing status' })
  @Column({ default: 'completed' })
  status!: 'processing' | 'completed' | 'failed';
}
