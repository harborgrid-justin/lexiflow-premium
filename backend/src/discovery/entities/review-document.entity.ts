import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { DiscoveryProject } from './discovery-project.entity';

export enum ReviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  REVIEWED = 'reviewed',
  QC_REQUIRED = 'qc_required',
  QC_IN_PROGRESS = 'qc_in_progress',
  QC_COMPLETE = 'qc_complete',
  DISPUTED = 'disputed',
  FINALIZED = 'finalized',
}

export enum ResponsivenessCode {
  RESPONSIVE = 'responsive',
  NON_RESPONSIVE = 'non_responsive',
  PARTIALLY_RESPONSIVE = 'partially_responsive',
  NOT_REVIEWED = 'not_reviewed',
}

export enum PrivilegeCode {
  NONE = 'none',
  ATTORNEY_CLIENT = 'attorney_client',
  WORK_PRODUCT = 'work_product',
  ATTORNEY_CLIENT_WORK_PRODUCT = 'attorney_client_work_product',
  COMMON_INTEREST = 'common_interest',
  JOINT_DEFENSE = 'joint_defense',
  OTHER = 'other',
}

export enum ConfidentialityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  HIGHLY_CONFIDENTIAL = 'highly_confidential',
  ATTORNEYS_EYES_ONLY = 'attorneys_eyes_only',
}

@Entity('review_documents')
@Index(['projectId'])
@Index(['batesNumber'])
@Index(['reviewStatus'])
@Index(['responsivenessCode'])
@Index(['privilegeCode'])
@Index(['reviewerId'])
@Index(['qcReviewerId'])
@Index(['tarScore'])
@Index(['createdAt'])
export class ReviewDocument extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => DiscoveryProject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: DiscoveryProject;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string;

  @Column({ name: 'bates_number', type: 'varchar', length: 100, unique: true })
  batesNumber!: string;

  @Column({ name: 'bates_range_start', type: 'varchar', length: 100, nullable: true })
  batesRangeStart!: string;

  @Column({ name: 'bates_range_end', type: 'varchar', length: 100, nullable: true })
  batesRangeEnd!: string;

  @Column({ name: 'document_title', type: 'varchar', length: 500, nullable: true })
  documentTitle!: string;

  @Column({ name: 'file_name', type: 'varchar', length: 500, nullable: true })
  fileName!: string;

  @Column({ name: 'file_type', type: 'varchar', length: 50, nullable: true })
  fileType!: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: number;

  @Column({ name: 'file_path', type: 'varchar', length: 1000, nullable: true })
  filePath!: string;

  @Column({ name: 'md5_hash', type: 'varchar', length: 32, nullable: true })
  md5Hash!: string;

  @Column({ name: 'sha256_hash', type: 'varchar', length: 64, nullable: true })
  sha256Hash!: string;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount!: number;

  @Column({ name: 'custodian', type: 'varchar', length: 300, nullable: true })
  custodian!: string;

  @Column({ name: 'custodian_id', type: 'uuid', nullable: true })
  custodianId!: string;

  @Column({ name: 'author', type: 'varchar', length: 300, nullable: true })
  author!: string;

  @Column({ name: 'sender', type: 'varchar', length: 300, nullable: true })
  sender!: string;

  @Column({ name: 'recipients', type: 'jsonb', nullable: true })
  recipients!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  subject!: string;

  @Column({ name: 'document_date', type: 'timestamp', nullable: true })
  documentDate!: Date;

  @Column({ name: 'created_date', type: 'timestamp', nullable: true })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'timestamp', nullable: true })
  modifiedDate!: Date;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ name: 'extracted_text', type: 'text', nullable: true })
  extractedText!: string;

  @Column({
    name: 'review_status',
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.NOT_STARTED,
  })
  reviewStatus!: ReviewStatus;

  @Column({
    name: 'responsiveness_code',
    type: 'enum',
    enum: ResponsivenessCode,
    default: ResponsivenessCode.NOT_REVIEWED,
  })
  responsivenessCode!: ResponsivenessCode;

  @Column({
    name: 'privilege_code',
    type: 'enum',
    enum: PrivilegeCode,
    default: PrivilegeCode.NONE,
  })
  privilegeCode!: PrivilegeCode;

  @Column({
    name: 'confidentiality_level',
    type: 'enum',
    enum: ConfidentialityLevel,
    default: ConfidentialityLevel.INTERNAL,
  })
  confidentialityLevel!: ConfidentialityLevel;

  @Column({ name: 'issue_tags', type: 'jsonb', nullable: true })
  issueTags!: Array<{
    issueId: string;
    issueName: string;
    relevance: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  tags!: string[];

  @Column({ name: 'hot_document', type: 'boolean', default: false })
  hotDocument!: boolean;

  @Column({ name: 'redaction_required', type: 'boolean', default: false })
  redactionRequired!: boolean;

  @Column({ name: 'redaction_notes', type: 'text', nullable: true })
  redactionNotes!: string;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId!: string;

  @Column({ name: 'reviewer_name', type: 'varchar', length: 300, nullable: true })
  reviewerName!: string;

  @Column({ name: 'review_date', type: 'timestamp', nullable: true })
  reviewDate!: Date;

  @Column({ name: 'review_time_seconds', type: 'int', nullable: true })
  reviewTimeSeconds!: number;

  @Column({ name: 'reviewer_notes', type: 'text', nullable: true })
  reviewerNotes!: string;

  @Column({ name: 'qc_reviewer_id', type: 'uuid', nullable: true })
  qcReviewerId!: string;

  @Column({ name: 'qc_reviewer_name', type: 'varchar', length: 300, nullable: true })
  qcReviewerName!: string;

  @Column({ name: 'qc_review_date', type: 'timestamp', nullable: true })
  qcReviewDate!: Date;

  @Column({ name: 'qc_notes', type: 'text', nullable: true })
  qcNotes!: string;

  @Column({ name: 'qc_approved', type: 'boolean', default: false })
  qcApproved!: boolean;

  @Column({ name: 'tar_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  tarScore!: number;

  @Column({ name: 'tar_prediction', type: 'varchar', length: 50, nullable: true })
  tarPrediction!: string;

  @Column({ name: 'tar_model_version', type: 'varchar', length: 50, nullable: true })
  tarModelVersion!: string;

  @Column({ name: 'is_duplicate', type: 'boolean', default: false })
  isDuplicate!: boolean;

  @Column({ name: 'duplicate_group_id', type: 'uuid', nullable: true })
  duplicateGroupId!: string;

  @Column({ name: 'parent_document_id', type: 'uuid', nullable: true })
  parentDocumentId!: string;

  @Column({ name: 'has_attachments', type: 'boolean', default: false })
  hasAttachments!: boolean;

  @Column({ name: 'attachment_count', type: 'int', default: 0 })
  attachmentCount!: number;

  @Column({ name: 'production_sets', type: 'jsonb', nullable: true })
  productionSets!: Array<{
    productionId: string;
    productionName: string;
    productionDate: Date;
  }>;

  @Column({ name: 'native_file_path', type: 'varchar', length: 1000, nullable: true })
  nativeFilePath!: string;

  @Column({ name: 'text_file_path', type: 'varchar', length: 1000, nullable: true })
  textFilePath!: string;

  @Column({ name: 'pdf_file_path', type: 'varchar', length: 1000, nullable: true })
  pdfFilePath!: string;

  @Column({ name: 'tiff_file_path', type: 'varchar', length: 1000, nullable: true })
  tiffFilePath!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
