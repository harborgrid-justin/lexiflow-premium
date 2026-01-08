import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/base/base.entity';

export enum ComplianceFramework {
  SOC2 = 'SOC2',
  HIPAA = 'HIPAA',
  GDPR = 'GDPR',
  ISO27001 = 'ISO27001',
  NIST = 'NIST',
  PCI_DSS = 'PCI_DSS',
  CCPA = 'CCPA',
  FERPA = 'FERPA',
}

export enum ControlStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  IN_PROGRESS = 'in_progress',
  NOT_APPLICABLE = 'not_applicable',
  NEEDS_REVIEW = 'needs_review',
}

export enum ControlSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('compliance_controls')
@Index(['framework'])
@Index(['status'])
@Index(['controlId'])
@Index(['severity'])
@Index(['nextReviewDate'])
export class ComplianceControl extends BaseEntity {
  @ApiProperty({ enum: ComplianceFramework, description: 'Compliance framework this control belongs to' })
  @Column({
    type: 'enum',
    enum: ComplianceFramework,
  })
  framework!: ComplianceFramework;

  @ApiProperty({ description: 'Unique control identifier within the framework (e.g., SOC2-CC6.1)' })
  @Column({ name: 'control_id', type: 'varchar', length: 100 })
  controlId!: string;

  @ApiProperty({ description: 'Name of the control' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Detailed description of the control requirement' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ description: 'Category or domain (e.g., Access Control, Data Protection)' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string;

  @ApiProperty({ enum: ControlStatus, description: 'Current compliance status of this control' })
  @Column({
    type: 'enum',
    enum: ControlStatus,
    default: ControlStatus.NEEDS_REVIEW,
  })
  status!: ControlStatus;

  @ApiProperty({ enum: ControlSeverity, description: 'Severity level of this control' })
  @Column({
    type: 'enum',
    enum: ControlSeverity,
    default: ControlSeverity.MEDIUM,
  })
  severity!: ControlSeverity;

  @ApiProperty({ description: 'Implementation details and how the control is satisfied' })
  @Column({ name: 'implementation_details', type: 'text', nullable: true })
  implementationDetails!: string;

  @ApiProperty({ description: 'Evidence of compliance (URLs, file paths, references)' })
  @Column({ type: 'jsonb', nullable: true })
  evidence!: {
    type?: string;
    description?: string;
    url?: string;
    documentId?: string;
    uploadedAt?: Date;
    uploadedBy?: string;
  }[];

  @ApiProperty({ description: 'Automated testing results' })
  @Column({ name: 'test_results', type: 'jsonb', nullable: true })
  testResults!: {
    testId?: string;
    testName?: string;
    passed?: boolean;
    executedAt?: Date;
    details?: string;
  }[];

  @ApiProperty({ description: 'Owner or responsible party for this control' })
  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId!: string;

  @ApiProperty({ description: 'Owner name' })
  @Column({ name: 'owner_name', type: 'varchar', length: 255, nullable: true })
  ownerName!: string;

  @ApiProperty({ description: 'Date when control was last reviewed' })
  @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
  lastReviewedAt!: Date;

  @ApiProperty({ description: 'User who last reviewed the control' })
  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string;

  @ApiProperty({ description: 'Next scheduled review date' })
  @Column({ name: 'next_review_date', type: 'timestamp', nullable: true })
  nextReviewDate!: Date;

  @ApiProperty({ description: 'Review frequency in days' })
  @Column({ name: 'review_frequency_days', type: 'integer', default: 90 })
  reviewFrequencyDays!: number;

  @ApiProperty({ description: 'Findings or issues discovered during reviews' })
  @Column({ type: 'text', nullable: true })
  findings!: string;

  @ApiProperty({ description: 'Remediation actions taken or planned' })
  @Column({ name: 'remediation_actions', type: 'jsonb', nullable: true })
  remediationActions!: {
    action?: string;
    status?: string;
    dueDate?: Date;
    completedAt?: Date;
    assignedTo?: string;
  }[];

  @ApiProperty({ description: 'Risk level if control fails' })
  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
  })
  riskLevel!: string;

  @ApiProperty({ description: 'Applicable to specific jurisdictions or regions' })
  @Column({ type: 'text', array: true, default: '{}' })
  jurisdictions!: string[];

  @ApiProperty({ description: 'Related controls (dependencies)' })
  @Column({ name: 'related_controls', type: 'text', array: true, default: '{}' })
  relatedControls!: string[];

  @ApiProperty({ description: 'Tags for categorization' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Automated monitoring enabled' })
  @Column({ name: 'automated_monitoring', type: 'boolean', default: false })
  automatedMonitoring!: boolean;

  @ApiProperty({ description: 'Monitoring configuration' })
  @Column({ name: 'monitoring_config', type: 'jsonb', nullable: true })
  monitoringConfig!: Record<string, unknown>;

  @ApiProperty({ description: 'Compliance score (0-100)' })
  @Column({ name: 'compliance_score', type: 'integer', nullable: true })
  complianceScore!: number;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'External audit notes' })
  @Column({ name: 'audit_notes', type: 'text', nullable: true })
  auditNotes!: string;

  @ApiProperty({ description: 'Is this control mandatory' })
  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory!: boolean;
}
