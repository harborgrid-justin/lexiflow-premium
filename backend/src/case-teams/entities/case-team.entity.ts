import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum TeamMemberRole {
  LEAD_ATTORNEY = 'Lead Attorney',
  CO_COUNSEL = 'Co-Counsel',
  ASSOCIATE = 'Associate',
  PARALEGAL = 'Paralegal',
  LEGAL_ASSISTANT = 'Legal Assistant',
  EXPERT_WITNESS = 'Expert Witness',
  CONSULTANT = 'Consultant',
  INVESTIGATOR = 'Investigator',
  OTHER = 'Other',
}

@Entity('case_team_members')
export class CaseTeamMember extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
  })
  role: TeamMemberRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ type: 'date', nullable: true })
  assignedDate?: Date;

  @Column({ type: 'date', nullable: true })
  removedDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
