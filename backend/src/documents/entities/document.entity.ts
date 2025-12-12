import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DocumentType, DocumentStatus } from '../interfaces/document.interface';

@Entity('documents')
@Index(['caseId', 'type'])
@Index(['status'])
@Index(['createdAt'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column({ type: 'uuid' })
  @Index()
  caseId: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  checksum: string;

  @Column({ type: 'int', default: 1 })
  currentVersion: number;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'int', nullable: true })
  pageCount: number;

  @Column({ type: 'int', nullable: true })
  wordCount: number;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  fullTextContent: string;

  @Column({ type: 'boolean', default: false })
  ocrProcessed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  ocrProcessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
