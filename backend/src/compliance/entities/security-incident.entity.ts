import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';

export enum IncidentSeverity {
  CRITICAL = 'critical', // Data breach, system compromise
  HIGH = 'high', // Unauthorized access, significant vulnerability
  MEDIUM = 'medium', // Failed access attempts, minor vulnerabilities
  LOW = 'low', // Suspicious activity, informational
}

export enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  ERADICATED = 'eradicated',
  RECOVERING = 'recovering',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  FALSE_POSITIVE = 'false_positive',
}

export enum IncidentCategory {
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MALWARE = 'malware',
  PHISHING = 'phishing',
  DDoS = 'ddos',
  INSIDER_THREAT = 'insider_threat',
  SYSTEM_COMPROMISE = 'system_compromise',
  DATA_LOSS = 'data_loss',
  POLICY_VIOLATION = 'policy_violation',
  PHYSICAL_SECURITY = 'physical_security',
  OTHER = 'other',
}

export enum IncidentImpact {
  CONFIDENTIALITY = 'confidentiality',
  INTEGRITY = 'integrity',
  AVAILABILITY = 'availability',
}

@Entity('security_incidents')
@Index(['severity'])
@Index(['status'])
@Index(['category'])
@Index(['detectedAt'])
@Index(['reporterId'])
export class SecurityIncident extends BaseEntity {
  @ApiProperty({ description: 'Incident title or summary' })
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty({ description: 'Detailed description of the incident' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ enum: IncidentSeverity, description: 'Severity level of the incident' })
  @Column({
    type: 'enum',
    enum: IncidentSeverity,
  })
  severity!: IncidentSeverity;

  @ApiProperty({ enum: IncidentStatus, description: 'Current status of the incident' })
  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.DETECTED,
  })
  status!: IncidentStatus;

  @ApiProperty({ enum: IncidentCategory, description: 'Category of the incident' })
  @Column({
    type: 'enum',
    enum: IncidentCategory,
  })
  category!: IncidentCategory;

  @ApiProperty({ description: 'Date and time incident was detected' })
  @Column({ name: 'detected_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  detectedAt!: Date;

  @ApiProperty({ description: 'Date and time incident actually occurred (if known)' })
  @Column({ name: 'occurred_at', type: 'timestamp', nullable: true })
  occurredAt!: Date;

  @ApiProperty({ description: 'User who reported/detected the incident' })
  @Column({ name: 'reporter_id', type: 'uuid' })
  reporterId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @ApiProperty({ description: 'User assigned to investigate/resolve' })
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee!: User;

  @ApiProperty({ description: 'Affected resources (systems, databases, applications)' })
  @Column({ name: 'affected_resources', type: 'jsonb' })
  affectedResources!: {
    type?: string;
    identifier?: string;
    description?: string;
    ipAddress?: string;
    hostname?: string;
    impacted?: boolean;
  }[];

  @ApiProperty({ description: 'Affected users or data subjects' })
  @Column({ name: 'affected_users', type: 'text', array: true, default: '{}' })
  affectedUsers!: string[];

  @ApiProperty({ description: 'Number of records affected' })
  @Column({ name: 'records_affected', type: 'integer', default: 0 })
  recordsAffected!: number;

  @ApiProperty({ description: 'Types of data compromised' })
  @Column({ name: 'data_types_affected', type: 'text', array: true, default: '{}' })
  dataTypesAffected!: string[];

  @ApiProperty({ enum: IncidentImpact, description: 'CIA triad impact areas' })
  @Column({
    name: 'impact_areas',
    type: 'enum',
    enum: IncidentImpact,
    array: true,
    default: '{}',
  })
  impactAreas!: IncidentImpact[];

  @ApiProperty({ description: 'Business impact description' })
  @Column({ name: 'business_impact', type: 'text', nullable: true })
  businessImpact!: string;

  @ApiProperty({ description: 'Estimated financial impact' })
  @Column({ name: 'financial_impact', type: 'decimal', precision: 10, scale: 2, nullable: true })
  financialImpact!: number;

  @ApiProperty({ description: 'Root cause analysis' })
  @Column({ name: 'root_cause', type: 'text', nullable: true })
  rootCause!: string;

  @ApiProperty({ description: 'Attack vector or method used' })
  @Column({ name: 'attack_vector', type: 'varchar', length: 255, nullable: true })
  attackVector!: string;

  @ApiProperty({ description: 'Indicators of Compromise (IoC)' })
  @Column({ type: 'jsonb', nullable: true })
  indicators!: {
    type?: string;
    value?: string;
    description?: string;
    source?: string;
    confidence?: string;
  }[];

  @ApiProperty({ description: 'Initial containment actions taken' })
  @Column({ name: 'containment_actions', type: 'text', nullable: true })
  containmentActions!: string;

  @ApiProperty({ description: 'Eradication steps performed' })
  @Column({ name: 'eradication_steps', type: 'text', nullable: true })
  eradicationSteps!: string;

  @ApiProperty({ description: 'Recovery actions and timeline' })
  @Column({ name: 'recovery_actions', type: 'text', nullable: true })
  recoveryActions!: string;

  @ApiProperty({ description: 'Current resolution status and details' })
  @Column({ type: 'text', nullable: true })
  resolution!: string;

  @ApiProperty({ description: 'Date incident was resolved' })
  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt!: Date;

  @ApiProperty({ description: 'Date incident was closed' })
  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt!: Date;

  @ApiProperty({ description: 'Lessons learned and recommendations' })
  @Column({ name: 'lessons_learned', type: 'text', nullable: true })
  lessonsLearned!: string;

  @ApiProperty({ description: 'Preventive measures recommended' })
  @Column({ name: 'preventive_measures', type: 'jsonb', nullable: true })
  preventiveMeasures!: {
    measure?: string;
    priority?: string;
    status?: string;
    assignedTo?: string;
    dueDate?: Date;
    completedAt?: Date;
  }[];

  @ApiProperty({ description: 'Notification requirements (GDPR breach notification, etc.)' })
  @Column({ name: 'notification_required', type: 'boolean', default: false })
  notificationRequired!: boolean;

  @ApiProperty({ description: 'Regulatory authorities to notify' })
  @Column({ name: 'authorities_to_notify', type: 'text', array: true, default: '{}' })
  authoritiesToNotify!: string[];

  @ApiProperty({ description: 'Notification status' })
  @Column({ name: 'notification_status', type: 'varchar', length: 100, nullable: true })
  notificationStatus!: string;

  @ApiProperty({ description: 'Date authorities were notified' })
  @Column({ name: 'authorities_notified_at', type: 'timestamp', nullable: true })
  authoritiesNotifiedAt!: Date;

  @ApiProperty({ description: 'Affected parties notification status' })
  @Column({ name: 'affected_parties_notified', type: 'boolean', default: false })
  affectedPartiesNotified!: boolean;

  @ApiProperty({ description: 'Date affected parties were notified' })
  @Column({ name: 'affected_parties_notified_at', type: 'timestamp', nullable: true })
  affectedPartiesNotifiedAt!: Date;

  @ApiProperty({ description: 'Evidence collected' })
  @Column({ type: 'jsonb', nullable: true })
  evidence!: {
    type?: string;
    description?: string;
    fileId?: string;
    collectedAt?: Date;
    collectedBy?: string;
    chainOfCustody?: string;
  }[];

  @ApiProperty({ description: 'Timeline of events' })
  @Column({ type: 'jsonb', nullable: true })
  timeline!: {
    timestamp?: Date;
    event?: string;
    details?: string;
    recordedBy?: string;
  }[];

  @ApiProperty({ description: 'Investigation notes' })
  @Column({ name: 'investigation_notes', type: 'text', nullable: true })
  investigationNotes!: string;

  @ApiProperty({ description: 'External parties involved (law enforcement, forensics, etc.)' })
  @Column({ name: 'external_parties', type: 'jsonb', nullable: true })
  externalParties!: {
    name?: string;
    type?: string;
    contactInfo?: string;
    role?: string;
  }[];

  @ApiProperty({ description: 'Compliance frameworks affected' })
  @Column({ name: 'compliance_frameworks', type: 'text', array: true, default: '{}' })
  complianceFrameworks!: string[];

  @ApiProperty({ description: 'Related incidents or cases' })
  @Column({ name: 'related_incidents', type: 'text', array: true, default: '{}' })
  relatedIncidents!: string[];

  @ApiProperty({ description: 'Post-incident review completed' })
  @Column({ name: 'review_completed', type: 'boolean', default: false })
  reviewCompleted!: boolean;

  @ApiProperty({ description: 'Post-incident review date' })
  @Column({ name: 'review_date', type: 'timestamp', nullable: true })
  reviewDate!: Date;

  @ApiProperty({ description: 'Post-incident review summary' })
  @Column({ name: 'review_summary', type: 'text', nullable: true })
  reviewSummary!: string;

  @ApiProperty({ description: 'Tags for categorization' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Priority level (1-5)' })
  @Column({ type: 'integer', default: 3 })
  priority!: number;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
