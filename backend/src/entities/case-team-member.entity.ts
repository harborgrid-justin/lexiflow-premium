import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';
import { User } from './user.entity';

@Entity('case_team_members')
@Index(['caseId'])
@Index(['userId'])
@Index(['role'])
@Index(['caseId', 'userId'], { unique: true })
export class CaseTeamMember extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: [
      'lead_attorney',
      'associate_attorney',
      'paralegal',
      'legal_assistant',
      'expert_witness',
      'consultant',
      'investigator',
      'other',
    ],
  })
  role: string;

  @Column({ type: 'date' })
  assignedDate: Date;

  @Column({ type: 'date', nullable: true })
  unassignedDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'integer', default: 0 })
  allocationPercentage: number;

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.teamMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @ManyToOne(() => User, (user) => user.caseTeamMemberships)
  @JoinColumn({ name: 'userId' })
  user: User;
}
