import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';
import { User } from '../../users/entities/user.entity';

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
@Index(['caseId'])
@Index(['userId'])
@Index(['role'])
@Index(['caseId', 'userId'], { unique: true })
export class CaseTeamMember extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.caseTeamMemberships)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
  })
  role!: TeamMemberRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ name: 'assigned_date', type: 'date', nullable: true })
  assignedDate?: Date;

  @Column({ name: 'removed_date', type: 'date', nullable: true })
  removedDate?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'allocation_percentage', type: 'integer', default: 0 })
  allocationPercentage!: number;

  @Column({ type: 'text', nullable: true })
  responsibilities!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
