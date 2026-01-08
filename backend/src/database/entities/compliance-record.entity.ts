import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * ComplianceRecord Entity
 *
 * Tracks compliance certifications, assessments, and regulatory compliance status
 * for legal organizations. Supports SOC 2, HIPAA, GDPR, and other frameworks.
 */
@Entity('compliance_records')
@Index(['organizationId'])
@Index(['framework'])
@Index(['status'])
@Index(['recordType'])
@Index(['certificationDate'])
@Index(['expirationDate'])
export class ComplianceRecord extends BaseEntity {
  @ApiProperty({ description: 'Organization ID this compliance record belongs to' })
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId!: string;

  @ApiProperty({ description: 'Compliance record type', enum: ['certification', 'assessment', 'audit', 'review', 'incident', 'remediation'] })
  @Column({
    name: 'record_type',
    type: 'enum',
    enum: ['certification', 'assessment', 'audit', 'review', 'incident', 'remediation'],
  })
  recordType!: string;

  @ApiProperty({ description: 'Compliance framework', enum: ['soc2_type1', 'soc2_type2', 'hipaa', 'gdpr', 'ccpa', 'pci_dss', 'iso27001', 'nist', 'fedramp', 'fisma', 'glba', 'sox', 'ferpa', 'coppa', 'custom'] })
  @Column({
    type: 'enum',
    enum: [
      'soc2_type1',
      'soc2_type2',
      'hipaa',
      'gdpr',
      'ccpa',
      'pci_dss',
      'iso27001',
      'nist',
      'fedramp',
      'fisma',
      'glba',
      'sox',
      'ferpa',
      'coppa',
      'custom',
    ],
  })
  framework!: string;

  @ApiProperty({ description: 'Compliance status', enum: ['compliant', 'non_compliant', 'in_progress', 'pending_review', 'remediation', 'expired', 'not_applicable'] })
  @Column({
    type: 'enum',
    enum: ['compliant', 'non_compliant', 'in_progress', 'pending_review', 'remediation', 'expired', 'not_applicable'],
    default: 'pending_review',
  })
  status!: string;

  @ApiProperty({ description: 'Title of the compliance record' })
  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @ApiProperty({ description: 'Detailed description', nullable: true })
  @Column({ type: 'text', nullable: true })
  description!: string;

  @ApiProperty({ description: 'Certification or audit number', nullable: true })
  @Column({ name: 'certification_number', type: 'varchar', length: 255, nullable: true })
  certificationNumber!: string;

  @ApiProperty({ description: 'Issuing authority or auditor', nullable: true })
  @Column({ name: 'issuing_authority', type: 'varchar', length: 255, nullable: true })
  issuingAuthority!: string;

  @ApiProperty({ description: 'Auditor company name', nullable: true })
  @Column({ name: 'auditor_name', type: 'varchar', length: 255, nullable: true })
  auditorName!: string;

  @ApiProperty({ description: 'Auditor contact email', nullable: true })
  @Column({ name: 'auditor_email', type: 'varchar', length: 255, nullable: true })
  auditorEmail!: string;

  @ApiProperty({ description: 'Date of certification or assessment', nullable: true })
  @Column({ name: 'certification_date', type: 'date', nullable: true })
  certificationDate!: Date;

  @ApiProperty({ description: 'Expiration date of certification', nullable: true })
  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate!: Date;

  @ApiProperty({ description: 'Next review date', nullable: true })
  @Column({ name: 'next_review_date', type: 'date', nullable: true })
  nextReviewDate!: Date;

  @ApiProperty({ description: 'Scope of compliance (what areas are covered)', nullable: true })
  @Column({ type: 'text', nullable: true })
  scope!: string;

  @ApiProperty({ description: 'Controls assessed', type: 'array' })
  @Column({ type: 'text', array: true, default: '{}' })
  controls!: string[];

  @ApiProperty({ description: 'Findings from the assessment (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  findings!: Record<string, unknown>;

  @ApiProperty({ description: 'Number of critical findings' })
  @Column({ name: 'critical_findings_count', type: 'integer', default: 0 })
  criticalFindingsCount!: number;

  @ApiProperty({ description: 'Number of high severity findings' })
  @Column({ name: 'high_findings_count', type: 'integer', default: 0 })
  highFindingsCount!: number;

  @ApiProperty({ description: 'Number of medium severity findings' })
  @Column({ name: 'medium_findings_count', type: 'integer', default: 0 })
  mediumFindingsCount!: number;

  @ApiProperty({ description: 'Number of low severity findings' })
  @Column({ name: 'low_findings_count', type: 'integer', default: 0 })
  lowFindingsCount!: number;

  @ApiProperty({ description: 'Remediation plan (JSON)', nullable: true })
  @Column({ name: 'remediation_plan', type: 'jsonb', nullable: true })
  remediationPlan!: Record<string, unknown>;

  @ApiProperty({ description: 'Remediation status', enum: ['not_started', 'in_progress', 'completed', 'verified', 'not_required'] })
  @Column({
    name: 'remediation_status',
    type: 'enum',
    enum: ['not_started', 'in_progress', 'completed', 'verified', 'not_required'],
    default: 'not_required',
  })
  remediationStatus!: string;

  @ApiProperty({ description: 'Target remediation date', nullable: true })
  @Column({ name: 'remediation_target_date', type: 'date', nullable: true })
  remediationTargetDate!: Date;

  @ApiProperty({ description: 'Actual remediation completion date', nullable: true })
  @Column({ name: 'remediation_completed_date', type: 'date', nullable: true })
  remediationCompletedDate!: Date;

  @ApiProperty({ description: 'Evidence and documentation links (JSON array)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  evidence!: string[];

  @ApiProperty({ description: 'Certificate document URL', nullable: true })
  @Column({ name: 'certificate_url', type: 'text', nullable: true })
  certificateUrl!: string;

  @ApiProperty({ description: 'Audit report URL', nullable: true })
  @Column({ name: 'audit_report_url', type: 'text', nullable: true })
  auditReportUrl!: string;

  @ApiProperty({ description: 'Risk level', enum: ['critical', 'high', 'medium', 'low', 'none'] })
  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: ['critical', 'high', 'medium', 'low', 'none'],
    default: 'medium',
  })
  riskLevel!: string;

  @ApiProperty({ description: 'Risk score (0-100)', nullable: true })
  @Column({ name: 'risk_score', type: 'integer', nullable: true })
  riskScore!: number;

  @ApiProperty({ description: 'Compliance score (0-100)', nullable: true })
  @Column({ name: 'compliance_score', type: 'integer', nullable: true })
  complianceScore!: number;

  @ApiProperty({ description: 'Responsible party user ID', nullable: true })
  @Column({ name: 'responsible_user_id', type: 'uuid', nullable: true })
  responsibleUserId!: string;

  @ApiProperty({ description: 'Reviewer user ID', nullable: true })
  @Column({ name: 'reviewer_user_id', type: 'uuid', nullable: true })
  reviewerUserId!: string;

  @ApiProperty({ description: 'Approved by user ID', nullable: true })
  @Column({ name: 'approved_by_user_id', type: 'uuid', nullable: true })
  approvedByUserId!: string;

  @ApiProperty({ description: 'Approved at timestamp', nullable: true })
  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @ApiProperty({ description: 'Cost of compliance assessment', nullable: true })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cost!: number;

  @ApiProperty({ description: 'Vendor or service provider', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor!: string;

  @ApiProperty({ description: 'Is this a recurring compliance requirement' })
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring!: boolean;

  @ApiProperty({ description: 'Recurrence frequency in months', nullable: true })
  @Column({ name: 'recurrence_months', type: 'integer', nullable: true })
  recurrenceMonths!: number;

  @ApiProperty({ description: 'Parent compliance record ID (for tracking recurring assessments)', nullable: true })
  @Column({ name: 'parent_record_id', type: 'uuid', nullable: true })
  parentRecordId!: string;

  @ApiProperty({ description: 'Notification sent flag' })
  @Column({ name: 'notification_sent', type: 'boolean', default: false })
  notificationSent!: boolean;

  @ApiProperty({ description: 'Days before expiration to send reminder' })
  @Column({ name: 'reminder_days_before', type: 'integer', default: 30 })
  reminderDaysBefore!: number;

  @ApiProperty({ description: 'Related case or matter IDs', type: 'array' })
  @Column({ name: 'related_case_ids', type: 'text', array: true, default: '{}' })
  relatedCaseIds!: string[];

  @ApiProperty({ description: 'Related document IDs', type: 'array' })
  @Column({ name: 'related_document_ids', type: 'text', array: true, default: '{}' })
  relatedDocumentIds!: string[];

  @ApiProperty({ description: 'Tags for categorization', type: 'array' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Additional notes', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes!: string;

  @ApiProperty({ description: 'Compliance record metadata (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Is publicly shareable (for client portal)', nullable: true })
  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic!: boolean;
}
