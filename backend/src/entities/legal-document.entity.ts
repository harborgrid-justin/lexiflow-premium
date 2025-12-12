import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';
import { DocumentVersion } from './document-version.entity';
import { User } from './user.entity';

@Entity('legal_documents')
@Index(['caseId'])
@Index(['documentType'])
@Index(['status'])
@Index(['createdBy'])
export class LegalDocument extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({
    type: 'enum',
    enum: [
      'contract',
      'agreement',
      'motion',
      'brief',
      'pleading',
      'discovery',
      'correspondence',
      'memorandum',
      'opinion',
      'order',
      'judgment',
      'exhibit',
      'evidence',
      'research',
      'template',
      'other',
    ],
  })
  documentType: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fileExtension: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'review', 'approved', 'final', 'archived', 'deleted'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  lastModifiedBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  categories: string[];

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean;

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ type: 'boolean', default: false })
  isPrivileged: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  templateId: string;

  @Column({ type: 'uuid', nullable: true })
  parentDocumentId: string;

  @Column({ type: 'uuid', nullable: true })
  folderId: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum: string;

  @Column({ type: 'text', nullable: true })
  extractedText: string;

  @Column({ type: 'integer', nullable: true })
  pageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.documents, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @OneToMany(() => DocumentVersion, (version) => version.document, {
    cascade: true,
  })
  versions: DocumentVersion[];
}
