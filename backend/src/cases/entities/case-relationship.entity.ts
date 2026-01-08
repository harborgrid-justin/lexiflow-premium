import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from './case.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum RelationshipType {
  RELATED = 'related',
  CONSOLIDATED = 'consolidated',
  APPEALED_FROM = 'appealed_from',
  APPEALED_TO = 'appealed_to',
  REMANDED_FROM = 'remanded_from',
  REMANDED_TO = 'remanded_to',
  LEAD_CASE = 'lead_case',
  MEMBER_CASE = 'member_case',
  CROSS_APPEAL = 'cross_appeal',
  DERIVATIVE = 'derivative',
  CLASS_ACTION_MEMBER = 'class_action_member',
  MULTIDISTRICT_LITIGATION = 'multidistrict_litigation',
  SEVERED_FROM = 'severed_from',
  SEVERED_TO = 'severed_to',
  TRANSFERRED_FROM = 'transferred_from',
  TRANSFERRED_TO = 'transferred_to',
  REOPENED = 'reopened',
  SUPERSEDED_BY = 'superseded_by',
  SUPERSEDES = 'supersedes',
  COMPANION = 'companion',
  PARALLEL = 'parallel',
  CUSTOM = 'custom',
}

@Entity('case_relationships')
@Index(['caseId1'])
@Index(['caseId2'])
@Index(['relationshipType'])
@Index(['isActive'])
@Index(['caseId1', 'caseId2', 'relationshipType'], { unique: true })
export class CaseRelationship extends BaseEntity {
  @ApiProperty({ description: 'First case ID in the relationship' })
  @Column({ name: 'case_id_1', type: 'uuid' })
  caseId1!: string;

  @ManyToOne(() => Case, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id_1' })
  case1!: Case;

  @ApiProperty({ description: 'Second case ID in the relationship' })
  @Column({ name: 'case_id_2', type: 'uuid' })
  caseId2!: string;

  @ManyToOne(() => Case, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id_2' })
  case2!: Case;

  @ApiProperty({ enum: RelationshipType, description: 'Type of relationship between cases' })
  @Column({
    name: 'relationship_type',
    type: 'enum',
    enum: RelationshipType,
  })
  relationshipType!: RelationshipType;

  @ApiProperty({ description: 'Description of the relationship' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Whether the relationship is bidirectional' })
  @Column({ name: 'is_bidirectional', type: 'boolean', default: false })
  isBidirectional!: boolean;

  @ApiProperty({ description: 'Strength or weight of the relationship (0-100)' })
  @Column({ name: 'relationship_strength', type: 'int', default: 50 })
  relationshipStrength!: number;

  @ApiProperty({ description: 'Date when the relationship was established' })
  @Column({ name: 'established_date', type: 'date', nullable: true })
  establishedDate?: Date;

  @ApiProperty({ description: 'Date when the relationship ended (if applicable)' })
  @Column({ name: 'ended_date', type: 'date', nullable: true })
  endedDate?: Date;

  @ApiProperty({ description: 'Whether the relationship is currently active' })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Court order or document establishing the relationship' })
  @Column({ name: 'source_document_id', type: 'uuid', nullable: true })
  sourceDocumentId?: string;

  @ApiProperty({ description: 'Court order or ruling reference' })
  @Column({ name: 'court_order_reference', type: 'varchar', length: 500, nullable: true })
  courtOrderReference?: string;

  @ApiProperty({ description: 'Judge who established the relationship' })
  @Column({ name: 'established_by_judge', type: 'varchar', length: 255, nullable: true })
  establishedByJudge?: string;

  @ApiProperty({ description: 'External case identifiers for case 2 (court, case number)' })
  @Column({ name: 'external_case_info', type: 'jsonb', nullable: true })
  externalCaseInfo?: {
    caseNumber?: string;
    court?: string;
    jurisdiction?: string;
    docketUrl?: string;
  };

  @ApiProperty({ description: 'Impact of relationship on case 1' })
  @Column({ name: 'impact_on_case_1', type: 'text', nullable: true })
  impactOnCase1?: string;

  @ApiProperty({ description: 'Impact of relationship on case 2' })
  @Column({ name: 'impact_on_case_2', type: 'text', nullable: true })
  impactOnCase2?: string;

  @ApiProperty({ description: 'Shared parties between the cases' })
  @Column({ name: 'shared_parties', type: 'jsonb', nullable: true })
  sharedParties?: string[];

  @ApiProperty({ description: 'Shared issues between the cases' })
  @Column({ name: 'shared_issues', type: 'jsonb', nullable: true })
  sharedIssues?: string[];

  @ApiProperty({ description: 'Tags for categorizing the relationship' })
  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Additional notes about the relationship' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  /**
   * Get the display name for the relationship from case 1's perspective
   */
  getRelationshipLabel(fromCaseId: string): string {
    const isCase1 = fromCaseId === this.caseId1;

    const labels: Record<RelationshipType, { forward: string; reverse: string }> = {
      [RelationshipType.RELATED]: { forward: 'Related to', reverse: 'Related to' },
      [RelationshipType.CONSOLIDATED]: { forward: 'Consolidated with', reverse: 'Consolidated with' },
      [RelationshipType.APPEALED_FROM]: { forward: 'Appealed from', reverse: 'Appealed to' },
      [RelationshipType.APPEALED_TO]: { forward: 'Appealed to', reverse: 'Appealed from' },
      [RelationshipType.REMANDED_FROM]: { forward: 'Remanded from', reverse: 'Remanded to' },
      [RelationshipType.REMANDED_TO]: { forward: 'Remanded to', reverse: 'Remanded from' },
      [RelationshipType.LEAD_CASE]: { forward: 'Lead case for', reverse: 'Member of lead case' },
      [RelationshipType.MEMBER_CASE]: { forward: 'Member of lead case', reverse: 'Lead case for' },
      [RelationshipType.CROSS_APPEAL]: { forward: 'Cross-appeal with', reverse: 'Cross-appeal with' },
      [RelationshipType.DERIVATIVE]: { forward: 'Derivative of', reverse: 'Has derivative' },
      [RelationshipType.CLASS_ACTION_MEMBER]: { forward: 'Class action member of', reverse: 'Class action includes' },
      [RelationshipType.MULTIDISTRICT_LITIGATION]: { forward: 'MDL member of', reverse: 'MDL includes' },
      [RelationshipType.SEVERED_FROM]: { forward: 'Severed from', reverse: 'Severed to' },
      [RelationshipType.SEVERED_TO]: { forward: 'Severed to', reverse: 'Severed from' },
      [RelationshipType.TRANSFERRED_FROM]: { forward: 'Transferred from', reverse: 'Transferred to' },
      [RelationshipType.TRANSFERRED_TO]: { forward: 'Transferred to', reverse: 'Transferred from' },
      [RelationshipType.REOPENED]: { forward: 'Reopened', reverse: 'Has reopened case' },
      [RelationshipType.SUPERSEDED_BY]: { forward: 'Superseded by', reverse: 'Supersedes' },
      [RelationshipType.SUPERSEDES]: { forward: 'Supersedes', reverse: 'Superseded by' },
      [RelationshipType.COMPANION]: { forward: 'Companion to', reverse: 'Companion to' },
      [RelationshipType.PARALLEL]: { forward: 'Parallel to', reverse: 'Parallel to' },
      [RelationshipType.CUSTOM]: { forward: 'Related to', reverse: 'Related to' },
    };

    const label = labels[this.relationshipType];
    return isCase1 ? label.forward : label.reverse;
  }
}
