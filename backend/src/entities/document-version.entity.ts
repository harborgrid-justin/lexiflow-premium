import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { LegalDocument } from './legal-document.entity';
import { User } from './user.entity';

@Entity('document_versions')
@Index(['documentId'])
@Index(['versionNumber'])
@Index(['createdBy'])
export class DocumentVersion extends BaseEntity {
  @Column({ type: 'uuid' })
  documentId: string;

  @Column({ type: 'integer' })
  versionNumber: number;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileName: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'text', nullable: true })
  changeDescription: string;

  @Column({ type: 'text', nullable: true })
  changeLog: string;

  @Column({ type: 'boolean', default: false })
  isMajorVersion: boolean;

  @Column({ type: 'boolean', default: false })
  isCurrentVersion: boolean;

  @Column({ type: 'text', nullable: true })
  extractedText: string;

  @Column({ type: 'integer', nullable: true })
  pageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  comparisonData: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  previousVersionId: string;

  @Column({ type: 'uuid', nullable: true })
  nextVersionId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => LegalDocument, (document) => document.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: LegalDocument;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
