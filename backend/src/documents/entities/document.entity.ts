import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { DocumentType, DocumentStatus } from '../interfaces/document.interface';
import { User } from '../../users/entities/user.entity';
import { Case } from '../../cases/entities/case.entity';

@Entity('documents')
@Index(['caseId', 'type'])
@Index(['status'])
export class Document extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column({ name: 'case_id', type: 'uuid' })
  @Index()
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column({ name: 'creator_id', type: 'uuid' })
  @Index()
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ nullable: true })
  filename: string;

  @Column({ name: 'file_path', nullable: true })
  filePath: string;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  checksum: string;

  @Column({ name: 'current_version', type: 'int', default: 1 })
  currentVersion: number;

  @Column({ nullable: true })
  author: string;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount: number;

  @Column({ name: 'word_count', type: 'int', nullable: true })
  wordCount: number;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ name: 'full_text_content', type: 'text', nullable: true })
  fullTextContent: string;

  @Column({ name: 'ocr_processed', type: 'boolean', default: false })
  ocrProcessed: boolean;

  @Column({ name: 'ocr_processed_at', type: 'timestamp', nullable: true })
  ocrProcessedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;
}
