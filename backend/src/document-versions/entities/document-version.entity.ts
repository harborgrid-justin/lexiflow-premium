import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('document_versions')
@Index(['documentId', 'version'])
export class DocumentVersion extends BaseEntity {
  @Column({ name: 'document_id', type: 'uuid' })
  @Index()
  documentId!: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @Column({ type: 'int' })
  version!: number;

  @Column()
  filename!: string;

  @Column({ name: 'file_path' })
  filePath!: string;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize!: number;

  @Column()
  checksum!: string;

  @Column({ name: 'change_description', type: 'text', nullable: true })
  changeDescription!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @Column({ name: 'full_text_content', type: 'text', nullable: true })
  fullTextContent!: string;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount!: number;

  @Column({ name: 'word_count', type: 'int', nullable: true })
  wordCount!: number;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ name: 'is_major_version', type: 'boolean', default: false })
  isMajorVersion!: boolean;

  @Column({ name: 'is_current_version', type: 'boolean', default: false })
  isCurrentVersion!: boolean;

  @Column({ name: 'comparison_data', type: 'jsonb', nullable: true })
  comparisonData!: Record<string, unknown>;

  @Column({ name: 'previous_version_id', type: 'uuid', nullable: true })
  previousVersionId!: string;

  @Column({ name: 'next_version_id', type: 'uuid', nullable: true })
  nextVersionId!: string;
}
